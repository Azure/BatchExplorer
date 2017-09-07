import { app, dialog, ipcMain, protocol } from "electron";
import * as path from "path";
app.setPath("userData", path.join(app.getPath("appData"), "batch-labs"));

import { batchLabsApp } from "./core";
import { logger } from "./logger";
import { PythonRpcServerProcess } from "./python-process";

const pythonServer = new PythonRpcServerProcess();
pythonServer.start();

batchLabsApp.init();

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

interface X509Certificate {
    issuerName: string;
    data: string;
    issuer: any;
    subject: any;
}

app.on("select-client-certificate", (
    event: Event,
    webcontents: Electron.WebContents,
    url: string,
    certificates: Electron.Certificate[],
    callback: (certificate: Electron.Certificate) => void) => {

    console.log("Show certificates", certificates);
    if (certificates.length <= 1) {
        // Default behavior is appropriate
        return false;
    }
    event.preventDefault();
    const picked = dialog.showMessageBox({
        message: "Pick certificate",
        buttons: certificates.map(x => x.issuerName),
    });

    console.log("picked", picked, certificates[picked]);
    callback(certificates[picked]);

    let index = -1;

    if (index >= 0) {
        callback(certificates[index]);
    }
});
