import { BrowserWindow } from "electron";

import { BatchClientProxyFactory, FileUtils } from "../api";
import { Constants } from "../client-constants";
import { UniqueWindow, batchLabsApp } from "../core";
import { logger, renderLogger } from "../logger";

// Webpack dev server url when using HOT=1
const devServerUrl = Constants.urls.main.dev;

// Webpack build output
const buildFileUrl = Constants.urls.main.prod;

export class MainWindow extends UniqueWindow {
    private _showWindowOnstart = false;

    public debugCrash() {
        this._showWindowOnstart = true;
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
        // anyWindow.batchClientFactory = new BatchClientProxyFactory();
        anyWindow.logger = renderLogger;
        anyWindow.splashScreen = batchLabsApp.splashScreen;
        anyWindow.authenticationWindow = batchLabsApp.authenticationWindow;
        anyWindow.fileUtils = new FileUtils();
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
        this.setupCommonEvents(window);
        window.webContents.on("crashed", (event: Electron.Event, killed: boolean) => {
            logger.error("There was a crash", event, killed);
            batchLabsApp.recoverWindow.createWithError(event.returnValue);
        });

        window.webContents.on("did-fail-load", (error) => {
            batchLabsApp.splashScreen.updateMessage(
                "Fail to load! Make sure you built the app or are running the dev-server.");
            logger.error("Fail to load", error);
        });

        window.on("unresponsive", (error: Error) => {
            logger.error("There was a crash", error);
            batchLabsApp.recoverWindow.createWithError(error.message);
        });
    }
}
