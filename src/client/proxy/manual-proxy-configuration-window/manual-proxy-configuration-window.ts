import { BrowserWindow, app, ipcMain } from "electron";
import { ProxySetting, ProxySettings } from "get-proxy-settings";

import { Constants } from "client/client-constants";
import { BatchLabsApplication, GenericWindow } from "client/core";
import { Deferred } from "common";
const urls = Constants.urls.manualProxyConfiguration;
const url = process.env.HOT ? urls.dev : urls.prod;

export class ManualProxyConfigurationWindow extends GenericWindow {
    public settings: Promise<ProxySettings>;
    private _deferred: Deferred<ProxySettings>;

    constructor(batchLabsApplication: BatchLabsApplication, private currentSettings: ProxySettings) {
        super(batchLabsApplication);
        this._deferred = new Deferred();
        this.settings = this._deferred.promise;
    }

    protected createWindow() {
        const window = new BrowserWindow({
            title: app.getName(),
            height: 400,
            width: 500,
            icon: Constants.urls.icon,
            resizable: false,
            titleBarStyle: "hidden",
            show: false,
            center: true,
        });
        if (this.currentSettings && (this.currentSettings.http || this.currentSettings.https)) {
            const setting = this.currentSettings.https || this.currentSettings.http;
            (window as any).currentSettings = {
                url: `${setting.protocol}://${setting.host}`,
                port: setting.port,
                username: setting.credentials && setting.credentials.username,
                password: setting.credentials && setting.credentials.password,
            };
        }

        window.loadURL(url);
        window.once("ready-to-show", () => {
            this.show();
        });
        this._setupEvents(window);
        return window;
    }

    private _setupEvents(window: BrowserWindow) {
        ipcMain.once("proxy-configuration-submitted", (event, { url, port, username, password }) => {
            this.hide();
            if (url && port) {
                const setting = new ProxySetting(`${url}:${port}`);
                setting.credentials = { username, password };
                this._deferred.resolve({ http: setting, https: setting });
            } else {
                this._deferred.resolve(null);
            }
            this.close();
        });
        window.on("close", () => {
            if (!this._deferred.hasCompleted) {
                this._deferred.reject(new Error("Window was closed"));
            }
        });
    }
}
