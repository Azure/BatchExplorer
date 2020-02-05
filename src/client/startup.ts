import { platformDynamicServer } from "@angular/platform-server";
import { LocaleService, TranslationsLoaderService } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { ClientTranslationsLoaderService } from "client/core/i18n";
import { MainApplicationMenu } from "client/menu";
import { app, protocol, session, shell } from "electron";
import { autoUpdater } from "electron-updater";
import * as path from "path";
import { BatchExplorerArgs } from "./cli";
import { Constants } from "./client-constants";
import { BatchExplorerClientModule, initializeServices } from "./client.module";
import { ClientLocaleService, listenToSelectCertifcateEvent } from "./core";
import { BatchExplorerApplication } from "./core/batch-explorer-application";

function initAutoUpdate() {
    autoUpdater.allowPrerelease = true;
    autoUpdater.autoDownload = true;
    autoUpdater.allowDowngrade = true;
    autoUpdater.logger = log;
    autoUpdater.updateConfigPath = path.join(Constants.root, "dev-app-update.yml");
}

function setupSingleInstance(batchExplorerApp: BatchExplorerApplication) {
    if (Constants.isDev) { return; }

    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
        log.info("There is already an instance of BatchExplorer open. Closing this one.");
        batchExplorerApp.quit();
    } else {
        app.on("second-instance", (event, commandLine, workingDirectory) => {
            log.info("Try to open labs again", commandLine);
            batchExplorerApp.openFromArguments(commandLine);
        });
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

async function startApplication(batchExplorerApp: BatchExplorerApplication, menu: MainApplicationMenu) {
    secureRemoteContentLoading();
    initAutoUpdate();
    registerAuthProtocol();

    // Uncomment to view why windows don't show up.
    batchExplorerApp.init().then(() => {
        menu.applyMenu();
        batchExplorerApp.start();
        // batchExplorerApp.debugCrash();
    });
}

export async function startBatchExplorer(args: BatchExplorerArgs) {
    // Those warnings are electron complaining we are loading remote data
    // But this is a false positive when using dev server has it doesn't seem to ignore localhost
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

    log.info("Program arguments", args);
    if (args.ignoreCertificateErrors) {
        log.warn("Ignoring HTTPS certificates");
        app.commandLine.appendSwitch("ignore-certificate-errors", "true");
    }

    if (args.disableAutoupdate) {
        log.warn("Application will not autoupdate");
        autoUpdater.autoInstallOnAppQuit = false;
    }

    const module = await platformDynamicServer().bootstrapModule(BatchExplorerClientModule);
    const localeService = module.injector.get(LocaleService) as ClientLocaleService;
    await localeService.load();
    const translationLoader = module.injector.get(TranslationsLoaderService) as ClientTranslationsLoaderService;
    await translationLoader.load();
    const batchExplorerApp = module.injector.get(BatchExplorerApplication);
    const menu = module.injector.get(MainApplicationMenu);
    initializeServices(module.injector);

    setupSingleInstance(batchExplorerApp);

    if (app.isReady()) {
        startApplication(batchExplorerApp, menu);
    } else {
        app.on("ready", async () => {
            startApplication(batchExplorerApp, menu);
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

function secureRemoteContentLoading() {
    app.on("web-contents-created", (event, contents) => {
        contents.on("new-window", (event, navigationUrl) => {
            // In this example, we'll ask the operating system
            // to open this event's url in the default browser.
            event.preventDefault();

            shell.openExternal(navigationUrl);
        });
    });

    // This reject any permissions requested by remove websites(Like asking for location).
    // This should never get called as the above call shouldn't open any remote links
    session.defaultSession!.setPermissionRequestHandler((webContents, permission, callback) => {
        return callback(false);
    });
}
