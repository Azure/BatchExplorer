import { SanitizedError } from "@batch-flask/utils";
import { BatchExplorerApplication } from "client/core/batch-explorer-application";
import { Deferred } from "common";
import { BehaviorSubject, Observable } from "rxjs";
import { AADConfig } from "../aad-config";
import * as AADConstants from "../aad-constants";
import AuthProvider, { AuthorizationResult } from "../auth-provider";

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
        const description = error.error_description?.replace(/\+/g, " ");
        super(`${error.error}: ${description}`);
        this.error = error.error;
        this.description = description;
        this.state = error.state;
    }
}

interface AuthorizeQueueItem {
    tenantId: string;
    resourceURI: string;
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
    private _authQueue = new AuthorizeQueue();
    private _state = new BehaviorSubject(AuthenticationState.None);
    private _logoutDeferred: Deferred<void> | null;

    constructor(
        private app: BatchExplorerApplication,
        private config: AADConfig,
        private authProvider: AuthProvider
    ) {
        this.state = this._state.asObservable();
    }

    /**
     * Authorize the user against the specified tenant.
     * @returns Observable with the successful AuthorizeResult.
     */
    public async authorize(tenantId: string): Promise<AuthorizeResult> {
        return this.authorizeResource(
            tenantId, this.app.properties.azureEnvironment.arm
        );
    }

    /**
     * Authorizes a resource
     *
     * @param tenantId The tenant ID
     * @param resourceURI The resource URI
     * @returns a promise with AuthorizedResult
     */
    public async authorizeResource(tenantId: string, resourceURI: string):
    Promise<AuthorizeResult> {
        const existingAuth = this._authQueue.get(tenantId, resourceURI);
        if (existingAuth) {
            return existingAuth.deferred.promise;
        }
        const deferred = this._authQueue.add(tenantId, resourceURI);
        this._authorizeNext();
        return deferred.promise;
    }

    /**
     * This will try to do authorize silently first and if it fails show the login window to the user
     */
    public async authorizeTrySilentFirst(tenantId: string): Promise<AuthorizeResult> {
        return this.authorize(tenantId);
    }

    /**
     * Log the user out
     */
    public async logout() {
        if (this._logoutDeferred) {
            return this._logoutDeferred.promise;
        }

        this.authProvider.logout();
        this._authQueue.clear();

        const url = AADConstants.logoutUrl(this.app.properties.azureEnvironment.aadUrl, this.config.tenant);
        this._loadAuthWindow(url, { clear: true });
        const deferred = this._logoutDeferred = new Deferred();
        return deferred.promise;
    }

    private async _authorizeNext() {
        if (this._authQueue.authInProgress()) {
            return;
        }
        const { tenantId, resourceURI, deferred } = this._authQueue.shift();

        try {
            const authResult: AuthorizationResult =
                await this.authProvider.getToken({
                    resourceURI,
                    tenantId,
                    authCodeCallback: (url, silent) =>
                        this._authorizationCodeCallback(url, silent)
                });

            if (this._state.getValue() !== AuthenticationState.Authenticated) {
                this._state.next(AuthenticationState.Authenticated);
            }

            deferred.resolve({
                ...authResult,
                code: null,
                id_token: null,
                session_state: null
            });
        } catch (e) {
            deferred.reject(e);
        } finally {
            this._authQueue.current = null;
            this._authorizeNext();
        }
    }

    private async _authorizationCodeCallback(url: string, silent = false) {
        this._state.next(AuthenticationState.UserInput);
        return await this._loadAuthWindow(url, { show: !silent });
    }

    private _loadAuthWindow(url: string, { clear = false, show = true } = {}) {
        const authWindow = this.app.authenticationWindow;
        const deferred = new Deferred<string>();
        authWindow.create();
        authWindow.onRedirect(newUrl =>
            this._authWindowRedirected(newUrl, deferred));
        authWindow.onNavigate(newUrl => this._handleNavigate(newUrl));
        authWindow.onError(error => this._handleError(error));

        if (clear) {
            authWindow.clearCookies();
        }

        authWindow.loadURL(url);
        if (show) {
            authWindow.show();
        }
        return deferred.promise;
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
     * @param callback Called with the result of the auth code
     */
    private _authWindowRedirected(url: string, deferred: Deferred<string>) {
        if (!this._isRedirectUrl(url) || !this._authQueue.hasCurrent()) {
            return;
        }

        this._closeWindow();
        const params: AuthCodeResult = this._getRedirectUrlParams(url);
        if (params.error) {
            deferred.reject(
                new AuthorizeError(params as AuthorizeResponseError)
            );
        } else {
            deferred.resolve(params.code);
        }
    }

    private _handleError({code, description}) {
        this._closeWindow();
        this._authQueue.rejectCurrent(new AuthorizeError({
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

/**
 * Manages multiple authorization requests
 */
class AuthorizeQueue {
    private queue: AuthorizeQueueItem[] = [];
    public current: AuthorizeQueueItem = null;

    public clear() {
        this.queue.forEach(
            auth => auth.deferred.reject(new LogoutError()));
        this.queue.length = 0;
        this.current = null;
    }

    public add(tenantId: string, resourceURI: string) {
        const deferred = new Deferred<AuthorizeResult>();
        this.queue.push({ tenantId, resourceURI, deferred });
        return deferred;
    }

    public shift(): AuthorizeQueueItem {
        this.current = this.queue.shift();
        return this.current;
    }

    public authInProgress() {
        return this.hasCurrent() || this.queue.length === 0;
    }

    public resolveCurrent(callback) {
        const deferred = this.current.deferred;
        this.current.deferred = null;
        deferred.resolve(callback);
        return deferred;
    }

    public rejectCurrent(callback) {
        const deferred = this.current.deferred;
        this.current.deferred = null;
        deferred.reject(callback);
        return deferred;
    }

    public get(tenantId: string, resourceURI: string) {
        if (this.current?.tenantId === tenantId && this.current?.resourceURI) {
            return this.current;
        }
        return this.queue.filter(auth =>
            auth.tenantId === tenantId && auth.resourceURI === resourceURI)[0];
    }

    public hasCurrent() {
         return !!this.current;
    }
}
