import { BrowserWindow, ipcMain } from "electron";

import { Constants } from "../client-constants";
import { BatchLabsApplication, FileSystem, GenericWindow, LocalFileStorage } from "../core";
import { logger, renderLogger } from "../logger";

// Webpack dev server url when using HOT=1
const devServerUrl = Constants.urls.main.dev;

// Webpack build output
const buildFileUrl = Constants.urls.main.prod;

export class MainWindow extends GenericWindow {
    public appReady: Promise<void>;
    private _showWindowOnstart = false;
    private _resolveAppReady: () => void;

    constructor(batchLabsApp: BatchLabsApplication) {
        super(batchLabsApp);
        this.appReady = new Promise((resolve) => {
            this._resolveAppReady = resolve;
        });
    }

    public debugCrash() {
        this._showWindowOnstart = true;
    }

    public async send(key: string, message: string) {
        if (this._window) {
            await this.appReady;
            this._window.webContents.send(key, message);
        }
    }

    protected createWindow() {
        const window = new BrowserWindow({
            height: 1000,
            icon: Constants.urls.icon,
            width: 1600,
            show: this._showWindowOnstart, // Don't show the window until the user authenticated
            webPreferences: {
                webSecurity: false,
            },
        });

        const url = process.env.HOT ? devServerUrl : buildFileUrl;
        this._setupEvents(window);
        window.loadURL(url);

        const anyWindow = window as any;
        anyWindow.logger = renderLogger;
        anyWindow.batchLabsApp = this.batchLabsApp;
        anyWindow.splashScreen = this.batchLabsApp.splashScreen;
        anyWindow.authenticationWindow = this.batchLabsApp.authenticationWindow;
        anyWindow.fs = new FileSystem();
        anyWindow.localFileStorage = new LocalFileStorage();
        anyWindow.clientConstants = Constants;

        // Open the DevTools.
        if (process.env.NODE_ENV !== "production") {
            window.webContents.openDevTools();
            // activate devtron for the user if they have it installed and it's not already added
            try {
                const devtronAlreadyAdded = BrowserWindow.getDevToolsExtensions &&
                    {}.hasOwnProperty.call(BrowserWindow.getDevToolsExtensions(), "devtron");

                if (!devtronAlreadyAdded) {
                    BrowserWindow.addDevToolsExtension(require("devtron").path);
                }
            } catch (error) {
                logger.error("Error adding devtron", error);
            }

        }

        return window;
    }

    private _setupEvents(window: Electron.BrowserWindow) {
        window.webContents.on("crashed", (event: Electron.Event, killed: boolean) => {
            logger.error("There was a crash", event, killed);
            this.batchLabsApp.recoverWindow.createWithError(event.returnValue);
        });

        ipcMain.once("app-ready", (event) => {
            if (event.sender.id === window.webContents.id) {
                logger.info("++== window");
                this._resolveAppReady();
            }
        });

        window.webContents.on("did-fail-load", (error) => {
            this.batchLabsApp.splashScreen.updateMessage(
                "Fail to load! Make sure you built the app or are running the dev-server.");
            logger.error("Fail to load", error);
        });

        window.on("unresponsive", (error: Error) => {
            logger.error("There was a crash", error);
            this.batchLabsApp.recoverWindow.createWithError(error.message);
        });
    }
}
