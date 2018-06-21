
import { app, protocol } from "electron";
import { autoUpdater } from "electron-updater";

import { log } from "@batch-flask/utils";
import { localStorage } from "client/core/local-storage";
import { Constants } from "./client-constants";
import { BatchLabsApplication, listenToSelectCertifcateEvent } from "./core";

function initAutoUpdate() {
    autoUpdater.allowPrerelease = true;
    autoUpdater.autoDownload = true;
    autoUpdater.logger = log;
    autoUpdater.setFeedURL("https://batchlabsdist.blob.core.windows.net/releases");
}

function setupSingleInstance(batchLabsApp: BatchLabsApplication) {
    if (Constants.isDev) { return; }
    const shouldQuit = app.makeSingleInstance((commandLine) => {
        log.info("Try to open labs again", commandLine);
        batchLabsApp.openFromArguments(commandLine);
    });

    if (shouldQuit) {
        log.info("There is already an instance of BatchLabs open. Closing this one.");
        batchLabsApp.quit();
    }
}

// Create the browser window.
function registerAuthProtocol() {
    // This call needs to be done after electron app is ready.
    protocol.registerStringProtocol("urn", (request, callback) => {
        // Doesn't matter how the protocol is handled; error is fine
        callback();
    });
}

async function startApplication(batchLabsApp: BatchLabsApplication) {
    initAutoUpdate();
    registerAuthProtocol();

    // Uncomment to view why windows don't show up.
    batchLabsApp.init().then(() => {
        batchLabsApp.start();
        // batchLabsApp.debugCrash();
    });
}

export async function startBatchLabs() {
    // Those warnings are electron complaining we are loading remote data
    // But this is a false positive when using dev server has it doesn't seem to ignore localhost
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
    localStorage.load();
    const batchLabsApp = new BatchLabsApplication(autoUpdater);
    setupSingleInstance(batchLabsApp);

    if (app.isReady()) {
        startApplication(batchLabsApp);
    } else {
        app.on("ready", async () => {
            startApplication(batchLabsApp);
        });
    }

    listenToSelectCertifcateEvent();

    process.on("exit", () => {
        batchLabsApp.quit();
    });

    process.on("SIGINT", () => {
        process.exit(-1);
    });

    process.on("SIGINT", () => {
        process.exit(-2);
    });
}
