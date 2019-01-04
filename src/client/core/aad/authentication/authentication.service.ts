import { BehaviorSubject, Observable } from "rxjs";

import { SecureUtils } from "@batch-flask/utils";
import { BatchExplorerApplication } from "client/core/batch-explorer-application";
import { Deferred } from "common";
import { AADConfig } from "../aad-config";
import * as AdalConstants from "../adal-constants";

enum AuthorizePromptType {
    login = "login",
    none = "none",
    consent = "consent",
}

export interface AuthorizeResult {
    code: string;
    id_token: string;
    session_state: string;
    state: string;
}

export interface AuthorizeResponseError {
    error: string;
    error_description: string;
    state?: string;
}

export class AuthorizeError extends Error {
    public error: string;
    public description: string;
    public state?: string;

    constructor(error: AuthorizeResponseError) {
        const description  = error.error_description && error.error_description.replace(/\+/g, " ");
        super(`${error.error}: ${description}`);
        this.error = error.error;
        this.description = description;
        this.state = error.state;
    }
}

interface AuthorizeQueueItem {
    tenantId: string;
    silent: boolean;
    deferred: Deferred<any>;
}

export enum AuthenticationState {
    None,
    UserInput,
    Authenticated,
}

export class LogoutError extends Error {

}

/**
 * This will open a new window at the /authorize endpoint to get the user
 */
export class AuthenticationService {
    public state: Observable<AuthenticationState>;
    // @ts-ignore
    private _waitingForAuth = false;
    private _authorizeQueue: AuthorizeQueueItem[] = [];
    private _currentAuthorization: AuthorizeQueueItem | null = null;
    private _state = new BehaviorSubject(AuthenticationState.None);
    private _logoutDeferred: Deferred<void> | null;

    constructor(private app: BatchExplorerApplication, private config: AADConfig) {
        this.state = this._state.asObservable();
    }
    /**
     * Authorize the user.
     * @param silent If set to true it will not ask the user for prompt. (i.e prompt=none for AD)
     *      This means the request will fail if the user didn't give consent yet or it expired
     * @returns Observable with the successful AuthorizeResult.
     *      If silent is true and the access fail the observable will return and error of type AuthorizeError
     */
    public async authorize(tenantId: string, silent = false): Promise<AuthorizeResult> {
        if (this._isAuthorizingTenant(tenantId)) {
            return this._getTenantDeferred(tenantId).promise;
        }
        const deferred = new Deferred<AuthorizeResult>();
        this._authorizeQueue.push({ tenantId, silent, deferred });
        this._authorizeNext();
        return deferred.promise;
    }

    /**
     * This will try to do authorize silently first and if it fails show the login window to the user
     */
    public async authorizeTrySilentFirst(tenantId: string): Promise<AuthorizeResult> {
        return this.authorize(tenantId, true).catch((error) => {
            if (error instanceof LogoutError) {
                throw error;
            }
            return this.authorize(tenantId, false);
        });
    }

    /**
     * Log the user out
     */
    public async logout() {
        this._waitingForAuth = true;

        if (this._logoutDeferred) {
            return this._logoutDeferred.promise;
        }

        const url = AdalConstants.logoutUrl(this.app.properties.azureEnvironment.aadUrl, this.config.tenant);
        const authWindow = this.app.authenticationWindow;
        authWindow.create();
        this._setupEvents();
        if (this._currentAuthorization) {
            this._currentAuthorization.deferred.reject(new LogoutError());
        }
        this._currentAuthorization = null;
        this._authorizeQueue.forEach(x => x.deferred.reject(new LogoutError()));
        this._authorizeQueue = [];
        authWindow.clearCookies();
        authWindow.loadURL(url);
        const deferred = this._logoutDeferred = new Deferred();
        return deferred.promise;
    }

    private _authorizeNext() {
        if (this._currentAuthorization || this._authorizeQueue.length === 0) {
            return;
        }
        this._waitingForAuth = true;
        const { tenantId, silent } = this._currentAuthorization = this._authorizeQueue.shift()!;
        const authWindow = this.app.authenticationWindow;
        authWindow.create();
        authWindow.loadURL(this._buildUrl(tenantId, silent));
        this._setupEvents();

        if (!silent) {
            authWindow.show();
            this._state.next(AuthenticationState.UserInput);
        }
    }

    /**
     * Return the url used to authorize
     * @param silent @see #authorize
     */
    private _buildUrl(tenantId, silent: boolean): string {
        const params: AdalConstants.AuthorizeUrlParams = {
            response_type: "id_token+code",
            redirect_uri: encodeURIComponent(this.config.redirectUri),
            client_id: this.config.clientId,
            scope: "user_impersonation+openid",
            nonce: SecureUtils.uuid(),
            state: SecureUtils.uuid(),
            resource: this.app.properties.azureEnvironment.armUrl,
        };

        if (silent) {
            params.prompt = AuthorizePromptType.none;
        }
        return AdalConstants.authorizeUrl(this.app.properties.azureEnvironment.aadUrl, tenantId, params);
    }

    /**
     * Setup event listener on the current window
     */
    private _setupEvents() {
        const authWindow = this.app.authenticationWindow;
        authWindow.onRedirect(newUrl => this._handleCallback(newUrl));
        authWindow.onNavigate(newUrl => this._handleNavigate(newUrl));
    }

    private _handleNavigate(url: string) {
        if (this._logoutDeferred && url.endsWith("oauth2/logout")) {
            this._closeWindow();
            this._waitingForAuth = false;
            const deferred = this._logoutDeferred;
            this._logoutDeferred = null;
            deferred.resolve();
        }
    }

    /**
     * Get called when the auth window redirect or navigate somewhere.
     * This is used to catch the final redirect_uri of AD'
     * @param url Url used for callback
     */
    private _handleCallback(url: string) {
        if (!this._isRedirectUrl(url) || !this._currentAuthorization) {
            return;
        }

        this._closeWindow();
        const params = this._getRedirectUrlParams(url);
        this._waitingForAuth = false;
        const auth = this._currentAuthorization;
        this._currentAuthorization = null;

        if ((params as any).error) {
            auth.deferred.reject(new AuthorizeError(params as AuthorizeResponseError));
        } else {
            this._state.next(AuthenticationState.Authenticated);
            auth.deferred.resolve(params as AuthorizeResult);
        }
        this._authorizeNext();
    }

    /**
     * If the given url is the final redirect_uri
     */
    private _isRedirectUrl(url: string) {
        return url.startsWith(this.config.redirectUri);
    }

    /**
     * Extract params return in the redirect_uri
     */
    private _getRedirectUrlParams(url: string): AuthorizeResult | AuthorizeResponseError {
        const segments = url.split("#");
        const params = {};
        for (const str of segments[1].split("&")) {
            const [key, value] = str.split("=");
            params[key] = decodeURIComponent(value);
        }
        return params as any;
    }

    private _isAuthorizingTenant(tenantId: string) {
        return Boolean(this._getTenantAuthorization(tenantId));
    }

    private _getTenantAuthorization(tenantId: string): AuthorizeQueueItem {
        if (this._currentAuthorization && this._currentAuthorization.tenantId === tenantId) {
            return this._currentAuthorization;
        }
        return this._authorizeQueue.filter(x => x.tenantId === tenantId)[0];
    }

    private _getTenantDeferred(tenantId: string): Deferred<any> {
        const auth = this._getTenantAuthorization(tenantId);
        return auth && auth.deferred;
    }

    private _closeWindow() {
        const window = this.app.authenticationWindow;
        if (window) {
            window.destroy();
        }
    }
}
