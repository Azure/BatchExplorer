
import { app, protocol } from "electron";
import { autoUpdater } from "electron-updater";
import { getProxySettings } from "get-proxy-settings";
import * as globalTunnel from "global-tunnel-ng";
import * as path from "path";

app.setPath("userData", path.join(app.getPath("appData"), "batch-labs"));

import { localStorage } from "client/core/local-storage";
import { Constants } from "./client-constants";
import { BatchLabsApplication, listenToSelectCertifcateEvent } from "./core";
import { logger } from "./logger";
import { setMenu } from "./menu";

function allowInsecureRequest() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

async function initProxySettings() {
    const settings = await getProxySettings();
    if (settings) {
        process.env.HTTP_PROXY = settings.http;
        process.env.HTTPS_PROXY = settings.https;
        allowInsecureRequest();
        globalTunnel.initialize();
    }
}

function initAutoUpdate() {
    if (Constants.isDev) {
        autoUpdater.updateConfigPath = path.join(Constants.root, "dev-app-update.yml");
    }
    autoUpdater.allowPrerelease = true;
    autoUpdater.autoDownload = true;
    autoUpdater.logger = logger;
}

function setupSingleInstance(batchLabsApp: BatchLabsApplication) {
    if (Constants.isDev) { return; }
    const shouldQuit = app.makeSingleInstance((commandLine) => {
        logger.info("Try to open labs again", commandLine);
        batchLabsApp.openFromArguments(commandLine);
    });

    if (shouldQuit) {
        app.quit();
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

function startApplication(batchLabsApp: BatchLabsApplication) {
    registerAuthProtocol();

    // Uncomment to view why windows don't show up.
    // batchLabsApp.debugCrash();
    batchLabsApp.init().then(() => {
        batchLabsApp.start();
    });
    setMenu(batchLabsApp);
}

export async function startBatchLabs() {
    await initProxySettings();
    initAutoUpdate();
    localStorage.load();

    const batchLabsApp = new BatchLabsApplication(autoUpdater);
    setupSingleInstance(batchLabsApp);

    console.log("Banana 1");
    if (app.isReady()) {
        startApplication(batchLabsApp);
    } else {
        app.on("ready", () => {
            startApplication(batchLabsApp);
        });
    }
    console.log("Banana 3");

    listenToSelectCertifcateEvent();
    console.log("Banana 4");

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
