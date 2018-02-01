import * as path from "path";
process.env.NODE_PATH = path.join(__dirname, "..");
// tslint:disable-next-line:no-var-requires
require("module").Module._initPaths();

import { Menu, app, protocol } from "electron";
import { autoUpdater } from "electron-updater";
import { setMenu } from "./menu";
app.setPath("userData", path.join(app.getPath("appData"), "batch-labs"));

import { localStorage } from "client/core/local-storage";
import { Constants } from "./client-constants";
import { BatchLabsApplication, listenToSelectCertifcateEvent } from "./core";
import { logger } from "./logger";

if (Constants.isDev) {
    autoUpdater.updateConfigPath = path.join(Constants.root, "dev-app-update.yml");
}
autoUpdater.allowPrerelease = true;
autoUpdater.autoDownload = true;
autoUpdater.logger = logger;
localStorage.load();

const batchLabsApp = new BatchLabsApplication(autoUpdater);

// Create the browser window.
function startApplication() {
    // This call needs to be done after electron app is ready.
    protocol.registerStringProtocol("urn", (request, callback) => {
        // Doesn't matter how the protocol is handled; error is fine
        callback();
    });

    if (!Constants.isDev) {
        const shouldQuit = app.makeSingleInstance((commandLine) => {
            logger.info("Try to open labs again", commandLine);
            batchLabsApp.openFromArguments(commandLine);
        });

        if (shouldQuit) {
            app.quit();
        }
    }

    // Uncomment to view why windows don't show up.
    // batchLabsApp.debugCrash();
    batchLabsApp.init().then(() => {
        batchLabsApp.start();
    });
    setMenu(batchLabsApp);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", startApplication);

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
