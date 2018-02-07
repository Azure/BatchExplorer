
import { app, protocol } from "electron";
import { autoUpdater } from "electron-updater";
import { getAndTestProxySettings } from "get-proxy-settings";
import * as globalTunnel from "global-tunnel-ng";
import * as path from "path";

app.setPath("userData", path.join(app.getPath("appData"), "batch-labs"));

import { localStorage } from "client/core/local-storage";
import { loadProxySettings } from "client/proxy";
import { Constants } from "./client-constants";
import { BatchLabsApplication, listenToSelectCertifcateEvent } from "./core";
import { logger } from "./logger";
import { setMenu } from "./menu";

function allowInsecureRequest() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

async function initProxySettings(batchLabsApp: BatchLabsApplication) {
    const settings = await loadProxySettings(batchLabsApp);
    if (settings) {
        if (settings.http) {
            process.env.HTTP_PROXY = settings.http.toString();
        }
        if (settings.https) {
            process.env.HTTPS_PROXY = settings.https.toString();
        }
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

async function startApplication(batchLabsApp: BatchLabsApplication) {
    await initProxySettings(batchLabsApp);
    initAutoUpdate();
    registerAuthProtocol();

    // Uncomment to view why windows don't show up.
    batchLabsApp.init().then(() => {
        batchLabsApp.start();
        batchLabsApp.debugCrash();
    });
    setMenu(batchLabsApp);
}

export async function startBatchLabs() {
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
        console.log("On exist...");
        batchLabsApp.quit();
    });

    process.on("SIGINT", () => {
        process.exit(-1);
    });

    process.on("SIGINT", () => {
        process.exit(-2);
    });
}
