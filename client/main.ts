import { BrowserWindow, app, protocol } from "electron";
import * as path from "path";

import { BatchClientProxyFactory } from "./api/batch-client-proxy";
import { Constants } from "./client-constants";
import { renderLogger } from "./logger";
import { SplashScreen } from "./splash-screen";

app.setPath("userData", path.join(app.getPath("appData"), "batch-labs"));

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: any;

// Webpack dev server url when using HOT=1
const devServerUrl = Constants.urls.main.dev;

// Webpack build output
const buildFileUrl = Constants.urls.main.prod;

const authWindowsToClose: Electron.BrowserWindow[] = [];
const splashScreen = new SplashScreen();

// Create the browser window.
function createWindow() {
    splashScreen.create();
    splashScreen.updateMessage("Loading app");
    protocol.registerStringProtocol("urn", (request, callback) => {
        // Close all auth windows that need to be closed
        while (authWindowsToClose.length) {
            authWindowsToClose.shift().close();
        }

        // Doesn't matter how the protocol is handled; error is fine
        callback();
    });

    /**
     * Setting the icon here will only work in Win and Linux. To set the icon on OS-X, use
     * electron-packager and set the icon using the --icon switch. It will need to be in .icns
     * format for OS X.
     */
    mainWindow = new BrowserWindow({
        height: 1000,
        icon: Constants.urls.icon,
        width: 1600,
        show: true, // Don't show the window until the user authenticated, comment to debug auth problems,
        webPreferences: {
            webSecurity: false,
        },
    });

    const url = process.env.HOT ? devServerUrl : buildFileUrl;

    mainWindow.loadURL(url);
    mainWindow.batchClientFactory = new BatchClientProxyFactory();
    mainWindow.logger = renderLogger;
    mainWindow.splashScreen = splashScreen;

    // Open the DevTools.
    if (process.env.NODE_ENV !== "production") {
        mainWindow.webContents.openDevTools();
    }

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
