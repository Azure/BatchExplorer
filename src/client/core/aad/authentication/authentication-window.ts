import { SanitizedError, log } from "@batch-flask/utils";
import { ClientConstants } from "client/client-constants";
import { UniqueWindow } from "client/core/unique-window";
import { BrowserWindow } from "electron";

export class AuthenticationWindow extends UniqueWindow {
    public createWindow() {
        const window = new BrowserWindow({
            width: 800,
            height: 700,
            show: false,
            center: true,
            webPreferences: {
                nodeIntegration: false,
                preload: ClientConstants.urls.preloadInsecureTest,
            },
            title: `BatchExplorer: Login to ${this.properties.azureEnvironment.name}`,
        });

        window.on("page-title-updated", (e, title) => {
            e.preventDefault();
        });

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
        this._window!.webContents.session.webRequest.onBeforeRedirect((details) => {
            callback(details.redirectURL);
        });
    }

    public onNavigate(callback: (url: string) => void) {
        this._window!.webContents.on("did-navigate", (event, url) => {
            callback(url);
        });
    }

    public onError(callback: (val: { code: number, description: string }) => void) {
        this._window!.webContents.on("did-fail-load", (
            e,
            errorCode: number,
            errorDescription: string,
            validatedUrl: string,
            isMainframe: boolean) => {

            // ignore error code -3: Aborted request(This happens on the redirect)
            if (this._window && errorCode !== -3) {
                log.info("Failed to load auth url", e);
                callback({ code: errorCode, description: errorDescription });
            }
        });
    }

    public onClose(callback: () => void) {
        this._window!.on("close", (event) => {
            callback();
        });
    }

    public clearCookies() {
        this._window!.webContents.session.clearStorageData({ storages: ["cookies"] });
    }
}
