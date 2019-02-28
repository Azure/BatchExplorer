import { Constants } from "client/client-constants";
import { BatchExplorerApplication, ClosedWindowError, UniqueWindow } from "client/core";
import { Deferred } from "common";
import { BrowserWindow, app, ipcMain } from "electron";
import { ProxyCredentials } from "get-proxy-settings";
const urls = Constants.urls.proxyCredentials;
const url = process.env.HOT ? urls.dev : urls.prod;

export class ProxyCredentialsWindow extends UniqueWindow {
    public credentials: Promise<ProxyCredentials>;
    private _deferred: Deferred<ProxyCredentials>;

    constructor(batchExplorerApplication: BatchExplorerApplication) {
        super(batchExplorerApplication);
        this._deferred = new Deferred();
        this.credentials = this._deferred.promise;
    }

    protected createWindow() {
        const window = new BrowserWindow({
            title: app.getName(),
            height: 340,
            width: 340,
            icon: Constants.urls.icon,
            resizable: false,
            titleBarStyle: "hidden",
            show: false,
            center: true,
        });
        window.loadURL(url);
        window.once("ready-to-show", () => {
            this.show();
        });
        this._setupEvents(window);
        return window;
    }

    private _setupEvents(window: BrowserWindow) {
        ipcMain.once("proxy-credentials-submitted", (event, { username, password }) => {
            this.hide();
            this._deferred.resolve({ username, password });
            // setTimeoutapp(() => {
            this.close();
            // }, 1000);
        });
        window.on("close", () => {
            if (!this._deferred.hasCompleted) {
                this._deferred.reject(new ClosedWindowError("Window was closed"));
            }
        });
    }
}
