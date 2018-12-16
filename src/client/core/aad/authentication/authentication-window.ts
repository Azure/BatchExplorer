import { SanitizedError } from "@batch-flask/utils";
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

    public onClose(callback: () => void) {
        this._window!.on("close", (event) => {
            callback();
        });
    }

    public clearCookies() {
        this._window!.webContents.session.clearStorageData({ storages: ["cookies"] });
    }
}
