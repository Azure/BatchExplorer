import * as electron from "electron";
import { AsyncSubject, Observable } from "rxjs";

import { SecureUtils } from "app/utils";
import { ElectronRemote } from "../electron";
import { AdalConfig } from "./adal-config";
import * as AdalConstants from "./adal-constants";

const { BrowserWindow } = electron.remote;

type AuthorizePromptType = "login" | "none" | "consent";
const AuthorizePromptType = {
    login: "login" as AuthorizePromptType,
    none: "none" as AuthorizePromptType,
    consent: "consent" as AuthorizePromptType,
};

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

/**
 * This will open a new window at the /authorize endpoint to get the user
 */
export class UserAuthorization {
    private _authWindow: Electron.BrowserWindow;
    private _waitingForAuth = false;
    private _authorizeQueue: AuthorizeQueueItem[] = [];
    private _currentAuthorization: AuthorizeQueueItem = null;

    constructor(private config: AdalConfig, private remote: ElectronRemote) {
    }

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
        const subject = new AsyncSubject();
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
        const url = AdalConstants.logoutUrl(this.config.tenant);
        const authWindow = this._createAuthWindow();

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
        const authWindow = this._createAuthWindow();
        console.log("Auth next ", authWindow);
        authWindow.loadURL(this._buildUrl(tenantId, silent));
        this._setupEvents();
        if (!silent) {
            authWindow.show();
            this.remote.getSplashScreen().hide();
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
        const authWindow = this._authWindow;

        authWindow.webContents.on("did-get-redirect-request", (event, oldUrl, newUrl) => {
            this._handleCallback(newUrl);
        });

        authWindow.on("close", (event) => {
            this._authWindow = null;
            // If the user closed manualy then we need to also close the main window
            if (this._waitingForAuth) {
                this.remote.getCurrentWindow().destroy();
                this.remote.getSplashScreen().destroy();
            }
        });
    }

    private _createAuthWindow(): Electron.BrowserWindow {
        this._closeWindow();
        this._authWindow = new BrowserWindow({
            width: 800, height: 700, show: false,
            center: true,
            webPreferences: {
                nodeIntegration: false,
            },
        });
        // Uncomment to debug auth errors
        // this._authWindow.webContents.openDevTools();
        this._authWindow.setMenu(null);
        return this._authWindow;
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

        if ((<any>params).error) {
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
        return <any>params;
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
        if (this._authWindow) {
            if (this._authWindow.isVisible()) {
                this.remote.getSplashScreen().show();
            }
            this._authWindow.destroy();
            this._authWindow = null;
        }
    }
}
