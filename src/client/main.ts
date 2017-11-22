import { Menu, app, dialog, ipcMain, protocol } from "electron";
import { autoUpdater } from "electron-updater";
import * as path from "path";
app.setPath("userData", path.join(app.getPath("appData"), "batch-labs"));

import { Constants } from "./client-constants";
import { BatchLabsApplication, listenToSelectCertifcateEvent } from "./core";
import { logger } from "./logger";
import { PythonRpcServerProcess } from "./python-process";

const pythonServer = new PythonRpcServerProcess();
pythonServer.start();

if (Constants.isDev) {
    autoUpdater.updateConfigPath = path.join(Constants.root, "dev-app-update.yml");
}
autoUpdater.allowPrerelease = true;
autoUpdater.autoDownload = true;
autoUpdater.logger = logger;

// Create the browser window.
function startApplication() {
    // This call needs to be done after electron app is ready.
    protocol.registerStringProtocol("urn", (request, callback) => {
        // Doesn't matter how the protocol is handled; error is fine
        callback();
    });

    const batchLabsApp = new BatchLabsApplication(autoUpdater);
    // Uncomment to view why windows don't show up.
    // batchLabsApp.debugCrash();
    batchLabsApp.init();
    batchLabsApp.start();

    if (process.platform === "darwin") {
        // Create our menu entries so that we can use MAC shortcuts
        Menu.setApplicationMenu(Menu.buildFromTemplate([
            {
                label: "Application",
                submenu: [
                    { label: "Quit", accelerator: "Command+Q", click: () => app.quit() },
                ],
            },
            {
                label: "Edit",
                submenu: [
                    { role: "undo" },
                    { role: "redo" },
                    { type: "separator" },
                    { role: "cut" },
                    { role: "copy" },
                    { role: "paste" },
                    { role: "delete" },
                    { role: "selectall" },
                ],
            },
        ]));
    }
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
