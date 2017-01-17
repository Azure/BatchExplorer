import { remote } from "electron";
import { AsyncSubject, Observable } from "rxjs";

import { SecureUtils } from "app/utils";
import { AdalConfig } from "./adal-config";
import * as AdalConstants from "./adal-constants";
const { BrowserWindow } = remote;

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

/**
 * This will open a new window at the /authorize endpoint to get the user
 */
export class UserAuthorization {
    private _authWindow: Electron.BrowserWindow;
    private _subject: AsyncSubject<AuthorizeResult>;
    private _waitingForAuth = false;

    constructor(private config: AdalConfig) {
    }

    /**
     * Authorize the user.
     * @param silent If set to true it will not ask the user for prompt. (i.e prompt=none for AD)
     *      This means the request will fail if the user didn't give consent yet or it expired
     * @returns Observable with the successfull AuthorizeResult.
     *      If silent is true and the access fail the observable will return and error of type AuthorizeError
     */
    public authorize(silent = false): Observable<AuthorizeResult> {
        this._waitingForAuth = true;
        this._subject = new AsyncSubject();
        const authWindow = this._createAuthWindow();
        authWindow.loadURL(this._buildUrl(silent));
        this._setupEvents();
        if (!silent) {
            authWindow.show();
        }
        return this._subject.asObservable();
    }

    /**
     * This will try to do authorize silently first and if it fails show the login window to the user
     */
    public authorizeTrySilentFirst(): Observable<AuthorizeResult> {
        return this.authorize(true).catch((error, source) => {
            return this.authorize(false);
        });
    }

    /**
     * Log the user out
     */
    public logout(): Observable<any> {
        this._waitingForAuth = true;
        this._subject = new AsyncSubject();
        const url = AdalConstants.logoutUrl(this.config.tenant, {
            post_logout_redirect_uri: encodeURIComponent(this._buildUrl(false)),
        });
        const authWindow = this._createAuthWindow();

        authWindow.loadURL(url);
        this._setupEvents();
        authWindow.show();
        return this._subject.asObservable();

    }

    /**
     * Return the url used to authorize
     * @param silent @see #authorize
     */
    private _buildUrl(silent: boolean): string {
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

        return AdalConstants.authorizeUrl(this.config.tenant, params);
    }

    /**
     * Setup event listener on the current window
     */
    private _setupEvents() {
        const authWindow = this._authWindow;
        authWindow.webContents.on("will-navigate", (event, url) => {
            this._handleCallback(url);
        });

        authWindow.webContents.on("did-get-redirect-request", (event, oldUrl, newUrl) => {
            this._handleCallback(newUrl);
        });

        authWindow.on("close", (event) => {
            this._authWindow = null;
            // If the user closed manualy then we need to also close the main window
            if (this._waitingForAuth) {
                remote.getCurrentWindow().destroy();
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
        if (!this._isRedirectUrl(url)) {
            return;
        }

        this._closeWindow();
        const params = this._getRedirectUrlParams(url);
        this._waitingForAuth = false;
        if ((<any>params).error) {
            this._subject.error(params as AuthorizeError);
        } else {
            this._subject.next(params as AuthorizeResult);
            this._subject.complete();
        }
    }

    /**
     * If the given url is the final redirect_uri
     */
    private _isRedirectUrl(url: string) {
        return url.match(/http:\/\/localhost\/.*/);
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

    private _closeWindow() {
        if (this._authWindow) {
            this._authWindow.destroy();
        }
    }
}
