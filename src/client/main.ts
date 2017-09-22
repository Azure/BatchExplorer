import { app, dialog, ipcMain, protocol } from "electron";
import { autoUpdater } from "electron-updater";
import * as path from "path";
app.setPath("userData", path.join(app.getPath("appData"), "batch-labs"));

import { Constants } from "./client-constants";
import { batchLabsApp, listenToSelectCertifcateEvent } from "./core";
import { logger } from "./logger";
import { PythonRpcServerProcess } from "./python-process";

const pythonServer = new PythonRpcServerProcess();
pythonServer.start();

batchLabsApp.init();
// TODO only for dev remove
autoUpdater.updateConfigPath = path.join(Constants.root, "dev-app-update.yml");
autoUpdater.allowPrerelease = true;
autoUpdater.autoDownload = true;

autoUpdater.checkForUpdates().then((data) => {
    console.log("Got data", data);
}).catch((err) => {
    console.log("Err", err);
});

// Create the browser window.
function startApplication() {
    // This call needs to be done after electron app is ready.
    protocol.registerStringProtocol("urn", (request, callback) => {
        // Doesn't matter how the protocol is handled; error is fine
        callback();
    });

    // Uncomment to view why windows don't show up.
    // batchLabsApp.debugCrash();

    batchLabsApp.start();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", startApplication);

listenToSelectCertifcateEvent();

process.on("exit", () => {
    pythonServer.stop();
});

process.on("SIGINT", () => {
    process.exit(-1);
});

process.on("SIGINT", () => {
    process.exit(-2);
});
