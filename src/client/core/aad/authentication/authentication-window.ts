import { SanitizedError, log } from "@batch-flask/utils";
import { ClientConstants } from "client/client-constants";
import { UniqueWindow } from "client/core/unique-window";
import { BrowserWindow } from "electron";
import { TenantPlaceholders } from "../aad-constants";

export class AuthenticationWindow extends UniqueWindow {
    public createWindow() {
        const window = new BrowserWindow({
            width: 800,
            height: 700,
            show: false,
            center: true,
            webPreferences: {
                enableRemoteModule: true,
                preload: ClientConstants.urls.preloadInsecureTest,
            },
            title: loginTitle(this.properties.azureEnvironment.name),
        });

        window.on("page-title-updated", e => e.preventDefault());

        // KLUDGE: Always treat close of auth window to be expected
        this.expectedClose = true;

        // Uncomment to debug auth errors
        // window.webContents.openDevTools();
        return window;
    }
    public loadURL(url: string) {
        if (!this._window) {
            throw new SanitizedError("AuthenticationWindow not created. Cannot call loadURL");
        }
        this._window.loadURL(url);
    }

    public onRedirect(callback: (newUrl: string) => void) {
        this._window.webContents.session.webRequest.onBeforeRedirect((details) => {
            callback(details.redirectURL);
        });
    }

    public setTitleTenant(tenant: string) {
        if (this._window && !this._window.isDestroyed()) {
            this._window?.setTitle(loginTitle(tenant in TenantPlaceholders ?
                this.properties.azureEnvironment.name :
                tenant
            ));
        }
    }

    public onNavigate(callback: (url: string) => void) {
        this._window.webContents.on("did-navigate", (event, url) => {
            callback(url);
        });
    }

    public onError(callback: (val: { code: number, description: string }) => void) {
        this._window.webContents.on("did-fail-load", (
            e,
            errorCode: number,
            errorDescription: string) => {

            // ignore error code -3: Aborted request(This happens on the redirect)
            if (this._window && errorCode !== -3) {
                log.info("Failed to load auth url", e);
                callback({ code: errorCode, description: errorDescription });
            }
        });
    }

    public onClose(callback: () => void) {
        this._window.on("close", () => {
            callback();
            this._window.destroy();
        });
    }

    public clearCookies() {
        this._window.webContents.session.clearStorageData({ storages: ["cookies"] });
    }

}

function loginTitle(entity: string) {
    return `BatchExplorer: Login to ${entity}`;
}
