import { autobind } from "@batch-flask/core";
import { Constants } from "client/client-constants";
import { BatchExplorerApplication, GenericWindow } from "client/core";
import { BrowserWindow, app, ipcMain, nativeImage } from "electron";
import { ProxySetting, ProxySettings } from "get-proxy-settings";

const urls = Constants.urls.manualProxyConfiguration;
const url = process.env.HOT ? urls.dev : urls.prod;

export interface ProxyConfiguration {
    url: string;
    port: string;
    username: string;
    password: string;
}

export class ManualProxyConfigurationWindow extends GenericWindow {
    public settings: Promise<ProxySettings | null>;
    private resolveSettings!: (value: ProxySettings | null) => void;
    private rejectSettings!: (reason?: any) => void;
    private proxyConfiguration: ProxyConfiguration | null = null;
    private settingsSaved = false;

    constructor(batchExplorerApplication: BatchExplorerApplication, private currentSettings?: ProxySettings | null) {
        super(batchExplorerApplication);
        this.settings = new Promise((resolve, reject) => {
            this.resolveSettings = resolve;
            this.rejectSettings = reject;
        });
    }

    public createWindow() {
        const window = this._initializeWindow();

        if (this.currentSettings) {
            const setting = this.currentSettings.https || this.currentSettings.http;
            if (setting) {
                this.proxyConfiguration = {
                    url: `${setting.protocol}://${setting.host}`,
                    port: setting.port,
                    username: setting.credentials?.username,
                    password: setting.credentials?.password,
                };
            }
        }

        window.loadURL(url).catch((error) => {
            console.error("Failed to load URL:", error);
            this.rejectSettings(error);
        });

        window.once("ready-to-show", () => this.show());

        this._setupEvents(window);
        return window;
    }

    private _initializeWindow() {
        return new BrowserWindow({
            title: app.name,
            height: 400,
            width: 500,
            icon: nativeImage.createFromDataURL(Constants.urls.icon),
            resizable: false,
            titleBarStyle: "hidden",
            show: false,
            center: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
    }

    private _setupEvents(window: BrowserWindow) {
        this._subscribeIpcHandlers();
        window.on("close", () => {
            this._unsubscribeIpcHandlers();
            if (!this.settingsSaved) {
                // inform caller that the window was closed
                this.rejectSettings("Window was closed");
            }
        });
    }

    private _subscribeIpcHandlers() {
        ipcMain.on("proxy-configuration-submitted", this._processNewSettings);
        ipcMain.handle("proxy-configuration-requested", this._loadProxySettings);
    }

    private _unsubscribeIpcHandlers() {
        ipcMain.removeListener("proxy-configuration-submitted", this._processNewSettings);
        ipcMain.removeHandler("proxy-configuration-requested");
    }

    @autobind()
    private _processNewSettings(_, config: ProxyConfiguration) {
        const { url, port, username, password } = config;
        this.hide();
        if (url && port) {
            const setting = new ProxySetting(`${url}:${port}`);
            if (username) {
                setting.credentials = { username, password };
            }
            this.resolveSettings({ http: setting, https: setting });
        } else {
            this.resolveSettings(null);
        }
        this.settingsSaved = true;
        this.close();
    }

    @autobind()
    private _loadProxySettings(): ProxyConfiguration | null {
        return this.proxyConfiguration;
    }
}
