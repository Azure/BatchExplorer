import { AsyncSubject, Observable } from "rxjs";

import { SecureUtils, log } from "app/utils";
import { ElectronRemote } from "../electron";
import { AdalConfig } from "./adal-config";
import * as AdalConstants from "./adal-constants";

enum AuthorizePromptType {
    login = "login",
    none = "none",
    consent = "consent",
}

export enum AuthorizeType {
    silent,
    prompt,
    silentThenPrompt,
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
    authorizeType: AuthorizeType;
    loginHint?: string;
    subject: AsyncSubject<any>;
}

/**
 * This will open a new window at the /authorize endpoint to get the user
 */
export class UserAuthorization {
    private _waitingForAuth = false;
    private _authorizeQueue: AuthorizeQueueItem[] = [];
    private _currentAuthorization: AuthorizeQueueItem = null;

    constructor(private config: AdalConfig, private remoteService: ElectronRemote) {
    }

    /**
     * Authorize the user.
     * @param silent If set to true it will not ask the user for prompt. (i.e prompt=none for AD)
     *      This means the request will fail if the user didn't give consent yet or it expired
     * @returns Observable with the successfull AuthorizeResult.
     *      If silent is true and the access fail the observable will return and error of type AuthorizeError
     */
    public authorize(
        tenantId: string,
        authorizeType = AuthorizeType.silentThenPrompt,
        loginHint: string = null): Observable<AuthorizeResult> {

        if (this._isAuthorizingTenant(tenantId)) {
            return this._getTenantSubject(tenantId).asObservable();
        }
        const subject = new AsyncSubject<AuthorizeResult>();
        this._authorizeQueue.push({ tenantId, authorizeType, subject, loginHint });
        this._authorizeNext();
        return subject.asObservable();
    }

    /**
     * This will try to do authorize silently first and if it fails show the login window to the user
     */
    public authorizeTrySilentFirst(tenantId: string, loginHint: string = null): Observable<AuthorizeResult> {
        return this.authorize(tenantId, AuthorizeType.silentThenPrompt, loginHint);
    }

    /**
     * Log the user out
     */
    public logout(): Observable<any> {
        this._waitingForAuth = true;
        const subject = new AsyncSubject();
        const url = AdalConstants.logoutUrl(this.config.tenant);
        const authWindow = this.remoteService.getAuthenticationWindow();
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
        const { tenantId, authorizeType, loginHint } = this._currentAuthorization = this._authorizeQueue.shift();
        const silent = authorizeType === AuthorizeType.silent || authorizeType === AuthorizeType.silentThenPrompt;
        this._openAuthorizeWindow(tenantId, silent, loginHint);
    }

    private _openAuthorizeWindow(tenantId: string, silent: boolean, loginHint?: string) {
        const authWindow = this.remoteService.getAuthenticationWindow();
        authWindow.create();
        this._setupEvents();
        const url = this._buildUrl(tenantId, silent, loginHint);
        if (silent) {
            authWindow.loadURL(url);
        } else {
            authWindow.loadURL(url);
            authWindow.show();
            this.remoteService.getSplashScreen().hide();
        }
    }

    /**
     * Return the url used to authorize
     * @param silent @see #authorize
     */
    private _buildUrl(tenantId, silent: boolean, loginHint?: string): string {
        const params: AdalConstants.AuthorizeUrlParams = {
            response_type: "id_token+code",
            redirect_uri: encodeURIComponent(this.config.redirectUri),
            client_id: this.config.clientId,
            scope: "user_impersonation+openid",
            nonce: SecureUtils.uuid(),
            state: SecureUtils.uuid(),
            resource: "https://management.core.windows.net/",
        };

        if (loginHint) {
            params.login_hint = loginHint;
        }
        if (silent) {
            params.prompt = AuthorizePromptType.none;
        }
        return AdalConstants.authorizeUrl(tenantId, params);
    }

    /**
     * Setup event listener on the current window
     */
    private _setupEvents() {
        const authWindow = this.remoteService.getAuthenticationWindow();

        authWindow.onRedirect(newUrl => this._handleCallback(newUrl));

        authWindow.onClose(() => {
            // If the user closed manualy then we need to also close the main window
            if (this._waitingForAuth) {
                this.remoteService.getSplashScreen().destroy();
                this.remoteService.getCurrentWindow().destroy();
            }
        });
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

        if ((params as any).error) {
            if (auth.authorizeType === AuthorizeType.silentThenPrompt) {
                auth.authorizeType = AuthorizeType.prompt;
                this._openAuthorizeWindow(auth.tenantId, false, auth.loginHint);
            } else {
                log.error("Authorization failed", params);
                this._currentAuthorization = null;
                auth.subject.error(params as AuthorizeError);
            }
        } else {
            this._currentAuthorization = null;
            auth.subject.next(params as AuthorizeResult);
            auth.subject.complete();
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
        return this._authorizeQueue.filter(x => x.tenantId === tenantId).first();
    }

    private _getTenantSubject(tenantId: string): AsyncSubject<any> {
        const auth = this._getTenantAuthorization(tenantId);
        return auth && auth.subject;
    }

    private _closeWindow() {
        const window = this.remoteService.getAuthenticationWindow();
        if (window) {
            if (window.isVisible()) {
                this.remoteService.getSplashScreen().show();
            }
            window.destroy();
        }
    }
}
