import { SanitizedError, SecureUtils } from "@batch-flask/utils";
import { BatchExplorerApplication } from "client/core/batch-explorer-application";
import { Deferred } from "common";
import { BehaviorSubject, Observable } from "rxjs";
import { AADService } from "..";
import { AADConfig } from "../aad-config";
import * as AADConstants from "../aad-constants";
import AuthProvider, { AuthorizationResult } from "../auth-provider";
import { AuthError } from "@azure/msal-node";
import { AuthObserver, UserAuthSelection } from "../auth-observer";
import { IpcEvent } from "common/constants";
import { first } from "rxjs/operators";

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
    error_code?: string;
    error_codes?: string[];
    error_uri?: string;
    state?: string;
}

export class AuthorizeError extends Error {
    public error: string;
    public description: string;
    public state?: string;
    public errorCodes: string[];
    public errorURI: string;

    constructor(error: AuthorizeResponseError) {
        const description = error.error_description?.replace(/\+/g, " ");
        super(`${error.error}: ${description}`);
        this.error = error.error;
        this.description = description;
        this.state = error.state;
        this.errorURI = error.error_uri;
        this.processErrorCodes(error);
    }

    processErrorCodes(error: AuthorizeResponseError) {
        this.errorCodes = error.error_codes || [];
        if (error.error_code) {
            this.errorCodes.push(error.error_code);
        }
        if (this.errorCodes.length === 0 && error.error_uri) {
            this.errorCodes.push(
                (new URL(error.error_uri)).searchParams.get("code")
            );
        }
    }
}

export enum AuthenticationState {
    None,
    UserInput,
    Authenticated,
    SignedOut,
    Canceled
}

enum TenantAuthState {
    canceled,
    pending,
    completed,
    signedOut,
    failed
}

export class SignOutException extends SanitizedError {
    constructor() { super("User logged out"); }
}

export class AuthCancelException extends SanitizedError {
    constructor() { super("User canceled"); }
}

export interface AuthorizeResourceOptions {
    tenantId: string;
    resourceURI: string;
    forceRefresh?: boolean;
    selectAuthMode?: boolean;
}

/**
 * This will open a new window at the /authorize endpoint to get the user
 */
export class AuthenticationService implements AuthObserver {
    public state: Observable<AuthenticationState>;
    private _authQueue = new AuthorizeQueue();
    private _state = new BehaviorSubject(AuthenticationState.None);

    public browserAuthMode: boolean;

    constructor(
        private app: BatchExplorerApplication,
        private config: AADConfig,
        private authProvider: AuthProvider,
        private aadService: AADService
    ) {
        this.state = this._state.asObservable();
        authProvider.setAuthObserver(this);
    }

    /**
     * Authorize the user against the specified tenant.
     * @returns Observable with the successful AuthorizeResult.
     */
    public async authorize(tenantId: string, forceRefresh = false):
    Promise<AuthorizeResult> {
        return this.authorizeResource({
            tenantId,
            resourceURI: this.app.properties.azureEnvironment.arm,
            forceRefresh
        });
    }

    /**
     * Authorizes a resource
     *
     * @param tenantId The tenant ID
     * @param resourceURI The resource URI
     * @param forceRefresh Whether to force authorization from AAD
     *
     * @returns a promise with AuthorizedResult
     */
    public async authorizeResource(
        options: AuthorizeResourceOptions
    ): Promise<AuthorizeResult> {
        const {
            tenantId,
            resourceURI,
            forceRefresh,
            selectAuthMode = true
        } = options;
        const existingAuth = this._authQueue.get(tenantId, resourceURI);
        if (existingAuth) {
            if (forceRefresh) {
                existingAuth.cancel("Force refresh");
            } else {
                return this.convertToAuthResponse(existingAuth.promise());
            }
        }
        const authItem = this._authQueue.add({
            tenantId, resourceURI, forceRefresh, selectAuthMode
        });
        this._authorizeNext();
        return this.convertToAuthResponse(authItem.promise());
    }

    /**
     * Log the user out
     *
     * If a tenant is specified, only logout from that tenant
     */
    public async logout(tenant?: string) {
        await this.authProvider.logout(tenant);

        if (tenant) {
            this._authQueue.remove(tenant,
                this.app.properties.azureEnvironment.arm);
        } else {
            this._authQueue.clear();
        }
    }

    private async _authorizeNext() {
        if (this._authQueue.authInProgress()) {
            return;
        }
        const authItem = this._authQueue.shift();
        const { tenantId, resourceURI, forceRefresh } = authItem;

        try {
            const authResult: AuthorizationResult =
                await this.authProvider.getToken({
                    resourceURI,
                    tenantId,
                    forceRefresh
                });

            if (this._state.getValue() !== AuthenticationState.Authenticated) {
                this._state.next(AuthenticationState.Authenticated);
            }

            authItem.complete({
                ...authResult,
                code: null,
                id_token: null,
                session_state: null,
                state: null
            });
        } catch (error) {
            authItem.error(error);
        } finally {
            this._authQueue.current = null;
            this._authorizeNext();
        }
    }

    /**
     * Authenticate using an Electron browser window
     *
     * @returns A promise which resolves to an auth code string
     */
    private async _loadAuthWindow(url: string,
        { clear = false, show = true, tenant = "" } = {}
    ): Promise<string> {
        const authWindow = this.app.authenticationWindow;
        authWindow.create();
        if (tenant !== "" && !(tenant in AADConstants.TenantPlaceholders)) {
            this._setAuthWindowTitle(tenant);
        }
        const deferred = new Deferred<string>();
        authWindow.onRedirect(url => this._authWindowRedirected(url,
            data => deferred.resolve(data)
        ));
        authWindow.onError(error => {
            this._handleError(error);
            deferred.reject(error);
        });
        authWindow.onClose(() => this._authCanceled());

        if (clear) {
            authWindow.clearCookies();
        }

        authWindow.loadURL(url);
        if (show) {
            authWindow.show();
        }
        return deferred.promise;
    }

    /**
     * Get called when the auth window redirect or navigate somewhere.
     * This is used to catch the final redirect_uri of AD'
     * @param url Url used for callback
     * @param callback Called with the result of the auth code
     */
    private _authWindowRedirected(url: string,
        callback: (code: string) => void) {
        if (!this._isRedirectUrl(url) || !this._authQueue.hasCurrent()) {
            return;
        }

        this._closeWindow();
        const params: AuthCodeResult = this._getRedirectUrlParams(url);
        if (params.error) {
            throw new AuthorizeError(params as AuthorizeResponseError);
        }
        callback(params.code);
    }

    private _authCanceled() {
        this._authQueue.cancelCurrent("Canceled authentication");
        if (!this._authQueue.empty()) {
            this._authorizeNext();
        }
    }

    private _handleError({code, description}) {
        this._closeWindow();
        this._authQueue.failCurrent(new AuthorizeError({
            error: "Failed to authenticate",
            error_description: `Failed to load the Microsoft login page (${code}:${description})`,
        }));
        if (!this._authQueue.empty()) {
            this._authorizeNext();
        }
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
            params[key] = value;
        });
        return params as any;
    }

    private _closeWindow() {
        const window = this.app.authenticationWindow;
        if (window) {
            window.destroy();
        }
    }

    private _setAuthWindowTitle(tenantId: string) {
        this.aadService.tenants.subscribe(
            tenants => {
                const matches = tenants.filter(t => t.tenantId === tenantId);
                this.app.authenticationWindow.setTitleTenant(
                    matches.length > 0 ? matches[0].displayName : tenantId
                );
            }
        );
    }

    public onAuthFailure(error: AuthError) {
        if (this._authQueue.hasCurrent()) {
            this._authQueue.failCurrent(error);
            this._authorizeNext();
        }
    }

    public async selectUserAuthMethod(tenantId: string): Promise<UserAuthSelection> {
        if (this._authQueue.current?.selectAuthMode) {
            this._state.next(AuthenticationState.UserInput);
            return this._selectUserAuthMethod(tenantId);
        } else {
            return new Promise(resolve => {
                this.app.userSettings.pipe(first()).subscribe(settings => {
                    resolve({ externalBrowserAuth: settings.externalBrowserAuth });
                });
            });
        }
    }

    private async _selectUserAuthMethod(tenantId: string): Promise<UserAuthSelection> {
        return new Promise<UserAuthSelection>((resolve, reject) => {
            const requestId = createUniqueId();
            const responseEvent = IpcEvent.userAuthSelectResponse(requestId);
            const listener = async (data) => {
                if (data.result === "cancel") {
                    this._authQueue.cancelCurrent("User canceled");
                    reject({ message: "User canceled" });
                } else {
                    resolve(data);
                }
            };
            this.app.onIPCEvent(responseEvent, data => listener(data));
            this.app.sendIPCEvent(IpcEvent.userAuthSelectRequest, {
                requestId,
                tenantId
            });
        });
    }

    public fetchAuthCode(url: string, tenantId: string): Promise<string> {
        return this._loadAuthWindow(url, { tenant: tenantId });
    }

    private convertToAuthResponse(promise: Promise<TenantAuthResult>): Promise<AuthorizeResult> {
        return promise.then(result => {
            if (result.type === TenantAuthState.completed) {
                return result.result;
            } else if (result.type === TenantAuthState.canceled) {
                throw new AuthCancelException();
            } else if (result.type === TenantAuthState.signedOut) {
                throw new SignOutException();
            } else {
                throw new Error(result.message);
            }
        });
    }
}

type TenantAuthResult = {
    type: TenantAuthState,
    message?: string;
    result?: AuthorizeResult;
};

class AuthorizeQueueItem {
    private deferred: Deferred<TenantAuthResult>;
    private _state: TenantAuthState = TenantAuthState.pending;

    constructor(
        public tenantId: string,
        public resourceURI: string,
        public forceRefresh: boolean,
        public selectAuthMode: boolean
    ) {
        this.deferred = new Deferred();
    }

    public promise() {
        return this.deferred.promise;
    }

    public cancel(reason?: string) {
        this.deferred.resolve({
            type: TenantAuthState.canceled,
            message: reason
        });
        this._state = TenantAuthState.canceled;
    }

    public complete(result: AuthorizeResult) {
        this.deferred.resolve({
            type: TenantAuthState.completed,
            result
        });
        this._state = TenantAuthState.completed;
    }

    public error(error: Error) {
        this.deferred.reject(error);
        this._state = TenantAuthState.failed;
    }

    public signOut() {
        this.deferred.resolve({
            type: TenantAuthState.signedOut
        });
        this._state = TenantAuthState.signedOut;
    }

    public get state() {
        return this._state;
    }
}

/**
 * Manages multiple authorization requests
 */
class AuthorizeQueue {
    private queue: AuthorizeQueueItem[] = [];
    public current: AuthorizeQueueItem = null;

    public clear() {
        this.queue.forEach(auth => auth.cancel());
        this.queue.length = 0;
        this.current = null;
    }

    public add(options: AuthorizeResourceOptions): AuthorizeQueueItem {
        const item = new AuthorizeQueueItem(
            options.tenantId,
            options.resourceURI,
            options.forceRefresh,
            options.selectAuthMode
        );
        this.queue.push(item);
        return item;
    }

    public shift(): AuthorizeQueueItem {
        this.current = this.queue.shift();
        return this.current;
    }

    public authInProgress() {
        return this.hasCurrent() || this.queue.length === 0;
    }

    public cancelCurrent(message?: string) {
        if (this.current) {
            this.current.cancel(message);
        }
    }

    public failCurrent(error: Error) {
        if (this.current) {
            this.current.error(error);
        } else {
            throw new Error(`No auth in progress. Original: ${error.message}`);
        }
    }

    public get(tenantId: string, resourceURI: string): AuthorizeQueueItem {
        if (this.current?.tenantId === tenantId && this.current?.resourceURI) {
            return this.current;
        }
        return this.queue.filter(auth =>
            auth.tenantId === tenantId && auth.resourceURI === resourceURI)[0];
    }

    public remove(tenantId: string, resourceURI: string) {
        let index = 0;
        let auth: AuthorizeQueueItem = null;
        while (index < this.queue.length) {
            auth = this.queue[index];
            if (this.matches(auth, tenantId, resourceURI)) {
                auth.signOut();
                break;
            }
            index++;
        }
        if (auth?.tenantId === this.current?.tenantId) {
            this.shift();
        } else if (index < this.queue.length) {
            this.queue.splice(index, 1);
        }
    }

    private matches(auth: AuthorizeQueueItem, tenantId: string,
        resourceURI: string) {
        return auth.tenantId === tenantId && auth.resourceURI === resourceURI;
    }

    public hasCurrent() {
         return !!this.current;
    }

    public empty() {
        return this.queue.length === 0;
    }
}

function createUniqueId(): string {
    return SecureUtils.uuid();
}
