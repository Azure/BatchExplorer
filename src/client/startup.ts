
import { platformDynamicServer } from "@angular/platform-server";
import { LocaleService, TranslationsLoaderService } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { ClientTranslationsLoaderService } from "client/core/i18n";
import { app, protocol } from "electron";
import { autoUpdater } from "electron-updater";
import { Constants } from "./client-constants";
import { BatchExplorerClientModule, initializeServices } from "./client.module";
import { ClientLocaleService, listenToSelectCertifcateEvent } from "./core";
import { BatchExplorerApplication } from "./core/batch-explorer-application";

function initAutoUpdate() {
    autoUpdater.allowPrerelease = true;
    autoUpdater.autoDownload = true;
    autoUpdater.allowDowngrade = true;
    autoUpdater.logger = log;
}

function setupSingleInstance(batchExplorerApp: BatchExplorerApplication) {
    if (Constants.isDev) { return; }
    const shouldQuit = app.makeSingleInstance((commandLine) => {
        log.info("Try to open labs again", commandLine);
        batchExplorerApp.openFromArguments(commandLine);
    });

    if (shouldQuit) {
        log.info("There is already an instance of BatchExplorer open. Closing this one.");
        batchExplorerApp.quit();
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

async function startApplication(batchExplorerApp: BatchExplorerApplication) {
    initAutoUpdate();
    registerAuthProtocol();

    // Uncomment to view why windows don't show up.
    batchExplorerApp.init().then(() => {
        batchExplorerApp.start();
        // batchExplorerApp.debugCrash();
    });
}

export async function startBatchExplorer() {
    // Those warnings are electron complaining we are loading remote data
    // But this is a false positive when using dev server has it doesn't seem to ignore localhost
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

    const module = await platformDynamicServer().bootstrapModule(BatchExplorerClientModule);
    const localeService = module.injector.get(LocaleService) as ClientLocaleService;
    await localeService.load();
    const translationLoader = module.injector.get(TranslationsLoaderService) as ClientTranslationsLoaderService;
    await translationLoader.load();
    const batchExplorerApp = module.injector.get(BatchExplorerApplication);
    initializeServices(module.injector);

    setupSingleInstance(batchExplorerApp);

    if (app.isReady()) {
        startApplication(batchExplorerApp);
    } else {
        app.on("ready", async () => {
            startApplication(batchExplorerApp);
        });
    }

    listenToSelectCertifcateEvent();

    process.on("exit", () => {
        batchExplorerApp.quit();
    });

    process.on("SIGINT", () => {
        process.exit(-1);
    });

    process.on("SIGINT", () => {
        process.exit(-2);
    });
}
