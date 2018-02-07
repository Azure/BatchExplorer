import { Deferred } from "common";
import { BrowserWindow, ipcMain } from "electron";
import { ProxyCredentials } from "get-proxy-settings";
import { Constants } from "../client-constants";
import { BatchLabsApplication, UniqueWindow } from "../core";

const urls = Constants.urls.proxyCredentials;
const url = process.env.HOT ? urls.dev : urls.prod;

export class ProxyCredentialsWindow extends UniqueWindow {
    public credentials: Promise<ProxyCredentials>;
    private _deferred: Deferred<ProxyCredentials>;

    constructor(batchLabsApplication: BatchLabsApplication) {
        super(batchLabsApplication);
        this._deferred = new Deferred();
        this.credentials = this._deferred.promise;
    }
    public destroy() {
        super.destroy();
    }

    protected createWindow() {
        const window = new BrowserWindow({
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
            this.destroy();
            this._deferred.resolve({ username, password });
        });
        window.on("close", () => {
            if (this._deferred.hasCompleted) {
                this._deferred.reject(new Error("Window was closed"));
            }
        });
    }
}
