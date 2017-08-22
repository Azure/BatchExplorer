import { app, ipcMain, protocol } from "electron";
import * as path from "path";
app.setPath("userData", path.join(app.getPath("appData"), "batch-labs"));

import { windows } from "./core";
import { logger } from "./logger";
import { PythonRpcServerProcess } from "./python-process";

const pythonServer = new PythonRpcServerProcess();
pythonServer.start();

// Create the browser window.
function createWindow() {
    windows.splashScreen.create();
    windows.splashScreen.updateMessage("Loading app");

    windows.main.debugCrash(); // Uncomment to debug any login/bootrstrap problems(Window doesn't show up)

    windows.main.create();
    protocol.registerStringProtocol("urn", (request, callback) => {
        // Doesn't matter how the protocol is handled; error is fine
        callback();
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
    if (windows.main.exists()) {
        createWindow();
    }
});

ipcMain.once("exit", () => {
    process.exit(1);
});

ipcMain.on("reload", () => {
    // Destroy window and error window if applicable
    windows.main.destroy();
    windows.recover.destroy();

    // Show splash screen
    windows.splashScreen.create();
    windows.splashScreen.updateMessage("Loading app");

    // Reopen a new window
    windows.main.create();
});

process.on("uncaughtException" as any, (error: Error) => {
    logger.error("There was a uncaught exception", error);
    windows.recover.createWithError(error.message);
});
