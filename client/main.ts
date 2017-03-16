// tslint:disable-next-line
/// <reference path="../definitions/index.d.ts"/>

import { BrowserWindow, app } from "electron";
import * as path from "path";

import { BatchClientProxyFactory } from "./api/batch-client-proxy";
import { renderLogger } from "./logger";

app.setPath("userData", path.join(app.getPath("appData"), "batch-labs"));

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: any;

// Webpack dev server url when using HOT=1
const devServerUrl = "http://localhost:3178/index.html";

// Webpack build output
const buildFileUrl = `file://${__dirname}/../../build/index.html`;

// Create the browser window.
function createWindow() {
    /**
     * Setting the icon here will only work in Win and Linux. To set the icon on OS-X, use
     * electron-packager and set the icon using the --icon switch. It will need to be in .icns
     * format for OS X.
     */
    mainWindow = new BrowserWindow({
        height: 1000,
        icon: __dirname + "/../assets/images/labs.ico",
        width: 1600,
        show: false, // Don't show the window until the user authenticated, comment to debug auth problems,
        webPreferences: {
            webSecurity: false,
        },
    });

    const url = process.env.HOT ? devServerUrl : buildFileUrl;

    mainWindow.loadURL(url);
    mainWindow.batchClientFactory = new BatchClientProxyFactory();
    mainWindow.logger = renderLogger;

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Clear out the main window when the app is closed
    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
