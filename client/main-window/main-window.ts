import { BrowserWindow } from "electron";

import { BatchClientProxyFactory } from "../api";
import { Constants } from "../client-constants";
import { UniqueWindow } from "../core";
import { windows } from "../core";
import { renderLogger } from "../logger";

// Webpack dev server url when using HOT=1
const devServerUrl = Constants.urls.main.dev;

// Webpack build output
const buildFileUrl = Constants.urls.main.prod;

export class MainWindow extends UniqueWindow {

    protected createWindow() {
        const window = new BrowserWindow({
            height: 1000,
            icon: Constants.urls.icon,
            width: 1600,
            show: false, // Don't show the window until the user authenticated, comment to debug auth problems,
            webPreferences: {
                webSecurity: false,
            },
        });
        const url = process.env.HOT ? devServerUrl : buildFileUrl;

        window.loadURL(url);

        const anyWindow = window as any;
        anyWindow.batchClientFactory = new BatchClientProxyFactory();
        anyWindow.logger = renderLogger;
        anyWindow.splashScreen = windows.splashScreen;
        anyWindow.authenticationWindow = windows.authentication;

        // Open the DevTools.
        if (process.env.NODE_ENV !== "production") {
            window.webContents.openDevTools();
        }

        return window;
    }
}
