import { AccessToken } from "@batch-flask/core";
import { SanitizedError } from "@batch-flask/utils";
import { BatchExplorerApplication } from "client/core/batch-explorer-application";
import { Deferred } from "common";
import { BehaviorSubject, Observable } from "rxjs";
import { AADConfig } from "../aad-config";
import * as AADConstants from "../aad-constants";
import AuthProvider, { AuthorizationResult } from "../auth-provider";
import {AADResourceName, AzurePublic} from "client/azure-environment";

export interface AuthorizeResult extends AuthorizationResult {
    code: string;
    id_token: string;
    session_state: string;
    state: string;
}

type AuthCodeResult = {
    code?: string;
    client_info?: string;
} & AuthorizeResponseError;

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
        const description = error.error_description && error.error_description.replace(/\+/g, " ");
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

export class LogoutError extends SanitizedError {
    constructor() {
        super("User logged out");
    }
}

/**
 * This will open a new window at the /authorize endpoint to get the user
 */
export class AuthenticationService {
    public state: Observable<AuthenticationState>;
    private _authCodeDeferred: Deferred<string>;
    private _state = new BehaviorSubject(AuthenticationState.None);
    private _logoutDeferred: Deferred<void> | null;
    private _authProvider: AuthProvider =
        new AuthProvider(this.app, this.config);

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
        return await this._authorizeNext();
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
        if (this._logoutDeferred) {
            return this._logoutDeferred.promise;
        }

        this._authProvider.logout();

        const url = AADConstants.logoutUrl(this.app.properties.azureEnvironment.aadUrl, this.config.tenant);
        this._loadAuthWindow(url, { clear: true });
        const deferred = this._logoutDeferred = new Deferred();
        return deferred.promise;
    }

    private async _authorizeNext(): Promise<AuthorizeResult> {
        this._authCodeDeferred = new Deferred<string>();
        const authResult: AuthorizationResult = await this._authProvider.getToken(AzurePublic.arm, async (url: string) => {
            this._loadAuthWindow(url, { show: true });
            this._state.next(AuthenticationState.UserInput);
            return await this._authCodeDeferred.promise;
        });
        this._state.next(AuthenticationState.Authenticated);
        return {
            ...authResult,
            code: null,
            id_token: null,
            session_state: null
        } as AuthorizeResult
    }

    private _loadAuthWindow(url: string, opts?: { show?: boolean, clear?: boolean }) {
        const authWindow = this.app.authenticationWindow;
        authWindow.create();
        this._setupEvents();

        if (opts.clear) {
            authWindow.clearCookies();
        }

        authWindow.loadURL(url);
        if (opts.show) {
            authWindow.show();
        }
    }

    /**
     * Setup event listener on the current window
     */
    private _setupEvents() {
        const authWindow = this.app.authenticationWindow;
        authWindow.onRedirect(newUrl => this._authWindowRedirected(newUrl));
        authWindow.onNavigate(newUrl => this._handleNavigate(newUrl));
        authWindow.onError((error) => {
            this._handleError(error);
        });
    }

    private _handleNavigate(url: string) {
        if (this._logoutDeferred && AADConstants.isLogoutURL(url)) {
            this._closeWindow();
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
    private _authWindowRedirected(url: string) {
        if (!this._isRedirectUrl(url) || !this._authCodeDeferred) {
            return;
        }

        this._closeWindow();
        const params: AuthCodeResult = this._getRedirectUrlParams(url);
        if ((params as any).error) {
            this._authCodeDeferred.reject(new AuthorizeError(params as AuthorizeResponseError));
        } else {
            this._authCodeDeferred.resolve(params.code);
        }
    }

    private _handleError({code, description}) {
        this._closeWindow();
        this._authCodeDeferred.reject(new AuthorizeError({
            error: "Failed to authenticate",
            error_description: `Failed to load the AAD login page (${code}:${description})`,
        }));
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
    private _getRedirectUrlParams(url: string): AuthCodeResult | AuthorizeResponseError  {
        const parsedUrl = new URL(url);
        const params = {};
        parsedUrl.searchParams.forEach((value: string, key: string) => {
            params[key] = value
        });
        return params as any;
    }

    private _closeWindow() {
        const window = this.app.authenticationWindow;
        if (window) {
            window.destroy();
        }
    }
}
