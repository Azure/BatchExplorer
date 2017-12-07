import { AsyncSubject, Observable } from "rxjs";

import { BatchLabsApplication } from "client/core";
import { SecureUtils } from "common/utils";
import { AdalConfig } from "../adal-config";
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

export interface AuthorizeError {
    error: string;
    error_description: string;
}

interface AuthorizeQueueItem {
    tenantId: string;
    silent: boolean;
    subject: AsyncSubject<any>;
}

const adalConfig: AdalConfig = {
    tenant: "common",
    clientId: "04b07795-8ddb-461a-bbee-02f9e1bf7b46", // Azure CLI
    redirectUri: "urn:ietf:wg:oauth:2.0:oob",
};

/**
 * This will open a new window at the /authorize endpoint to get the user
 */
export class UserAuthorization {
    // @ts-ignore
    private _waitingForAuth = false;
    private _authorizeQueue: AuthorizeQueueItem[] = [];
    private _currentAuthorization: AuthorizeQueueItem = null;

    constructor(private app: BatchLabsApplication) { }
    /**
     * Authorize the user.
     * @param silent If set to true it will not ask the user for prompt. (i.e prompt=none for AD)
     *      This means the request will fail if the user didn't give consent yet or it expired
     * @returns Observable with the successfull AuthorizeResult.
     *      If silent is true and the access fail the observable will return and error of type AuthorizeError
     */
    public authorize(tenantId: string, silent = false): Observable<AuthorizeResult> {
        if (this._isAuthorizingTenant(tenantId)) {
            return this._getTenantSubject(tenantId).asObservable();
        }
        const subject = new AsyncSubject<AuthorizeResult>();
        this._authorizeQueue.push({ tenantId, silent, subject });
        this._authorizeNext();
        return subject.asObservable();
    }

    /**
     * This will try to do authorize silently first and if it fails show the login window to the user
     */
    public authorizeTrySilentFirst(tenantId: string): Observable<AuthorizeResult> {
        return this.authorize(tenantId, true).catch((error, source) => {
            return this.authorize(tenantId, false);
        });
    }

    /**
     * Log the user out
     */
    public logout(): Observable<any> {
        this._waitingForAuth = true;
        const subject = new AsyncSubject();
        const url = AdalConstants.logoutUrl(adalConfig.tenant);
        const authWindow = this.app.authenticationWindow;
        authWindow.create();

        authWindow.loadURL(url);
        this._setupEvents();
        authWindow.show();
        return subject.asObservable();
    }

    private _authorizeNext() {
        if (this._currentAuthorization || this._authorizeQueue.length === 0) {
            return;
        }
        this._waitingForAuth = true;
        const { tenantId, silent } = this._currentAuthorization = this._authorizeQueue.shift();
        const authWindow = this.app.authenticationWindow;
        authWindow.create();
        authWindow.loadURL(this._buildUrl(tenantId, silent));
        this._setupEvents();
        if (!silent) {
            authWindow.show();
            this.app.splashScreen.hide();
        }
    }

    /**
     * Return the url used to authorize
     * @param silent @see #authorize
     */
    private _buildUrl(tenantId, silent: boolean): string {
        const params: AdalConstants.AuthorizeUrlParams = {
            response_type: "id_token+code",
            redirect_uri: encodeURIComponent(adalConfig.redirectUri),
            client_id: adalConfig.clientId,
            scope: "user_impersonation+openid",
            nonce: SecureUtils.uuid(),
            state: SecureUtils.uuid(),
            resource: "https://management.core.windows.net/",
        };

        if (silent) {
            params.prompt = AuthorizePromptType.none;
        }
        return AdalConstants.authorizeUrl(tenantId, params);
    }

    /**
     * Setup event listener on the current window
     */
    private _setupEvents() {
        const authWindow = this.app.authenticationWindow;
        authWindow.onRedirect(newUrl => this._handleCallback(newUrl));
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
            auth.subject.error(params as AuthorizeError);
        } else {
            auth.subject.next(params as AuthorizeResult);
            auth.subject.complete();
        }
        this._authorizeNext();
    }

    /**
     * If the given url is the final redirect_uri
     */
    private _isRedirectUrl(url: string) {
        return url.startsWith(adalConfig.redirectUri);
    }

    /**
     * Extract params return in the redirect_uri
     */
    private _getRedirectUrlParams(url: string): AuthorizeResult | AuthorizeError {
        const segments = url.split("#");
        const params = {};
        for (let str of segments[1].split("&")) {
            const [key, value] = str.split("=");
            params[key] = value;
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

    private _getTenantSubject(tenantId: string): AsyncSubject<any> {
        const auth = this._getTenantAuthorization(tenantId);
        return auth && auth.subject;
    }

    private _closeWindow() {
        const window = this.app.authenticationWindow;
        if (window) {
            if (window.isVisible()) {
                this.app.splashScreen.show();
            }
            window.destroy();
        }
    }
}
