import { app, ipcMain, session } from "electron";
import { AppUpdater, UpdateCheckResult, autoUpdater } from "electron-updater";
import * as os from "os";
import * as Url from "url";

import { setTimeout } from "timers";
import { AuthenticationWindow } from "../authentication";
import { Constants } from "../client-constants";
import { logger } from "../logger";
import { MainWindow } from "../main-window";
import { PythonRpcServerProcess } from "../python-process";
import { RecoverWindow } from "../recover-window";
import { SplashScreen } from "../splash-screen";

const osName = `${os.platform()}-${os.arch()}/${os.release()}`;
const isDev = Constants.isDev ? "-dev" : "";
const userAgent = `(${osName}) BatchLabs/${Constants.version}${isDev}`;

export class BatchLabsApplication {
    public splashScreen = new SplashScreen(this);
    public authenticationWindow = new AuthenticationWindow(this);
    public recoverWindow = new RecoverWindow(this);
    public mainWindow = new MainWindow(this);
    public pythonServer = new PythonRpcServerProcess();

    constructor(public autoUpdater: AppUpdater) {
        logger.info("ARguments", process.argv);
    }

    public init() {
        this._registerProtocol();
        this.setupProcessEvents();
    }

    /**
     * Start the app by showing the splash screen
     */
    public start() {
        this.pythonServer.start();
        const requestFilter = { urls: ["https://*", "http://*"] };
        session.defaultSession.webRequest.onBeforeSendHeaders(requestFilter, (details, callback) => {
            if (details.url.indexOf("batch.azure.com") !== -1) {
                details.requestHeaders["Origin"] = "http://localhost";
                details.requestHeaders["Cache-Control"] = "no-cache";
            }
            details.requestHeaders["User-Agent"] = userAgent;
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });

        this.splashScreen.create();
        this.splashScreen.updateMessage("Loading app");

        this.mainWindow.create();
        this._processArguments(["batchlabs.exe", "ms-batchlabs://route/jobs/a/tasks/002?accountId=/subscriptions/21abd678-18c5-4660-9fdd-8c5ba6b6fe1f/resourceGroups/Default-AzureBatch-BrazilSouth/providers/Microsoft.Batch/batchAccounts/prodtest1"]);
    }

    public setupProcessEvents() {
        ipcMain.on("reload", () => {
            // Destroy window and error window if applicable
            this.mainWindow.destroy();
            this.recoverWindow.destroy();
            this.splashScreen.destroy();
            this.authenticationWindow.destroy();

            // Show splash screen
            this.start();
        });

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
            if (!this.mainWindow.exists()) {
                this.start();
            }
        });

        ipcMain.once("exit", () => {
            process.exit(1);
        });

        process.on("uncaughtException" as any, (error: Error) => {
            logger.error("There was a uncaught exception", error);
            this.recoverWindow.createWithError(error.message);
        });

    }

    public debugCrash() {
        this.mainWindow.debugCrash();
    }

    public quit() {
        this.pythonServer.stop();
        app.quit();
    }

    public checkForUpdates(): Promise<UpdateCheckResult> {
        return autoUpdater.checkForUpdates();
    }

    private _registerProtocol() {
        if (Constants.isDev) {
            return;
        }

        if (app.setAsDefaultProtocolClient(Constants.customProtocolName)) {
            logger.info(`Registered ${Constants.customProtocolName}:// as a protocol for batchlabs`);
        } else {
            logger.error(`Failed to register ${Constants.customProtocolName}:// as a protocol for batchlabs`);
        }
    }

    private _processArguments(argv: string[]) {
        if (Constants.isDev || argv.length < 2) {
            return;
        }
        const arg = argv[1];
        if (Url.parse(arg).protocol === Constants.customProtocolName + ":") {
            this.mainWindow.send(Constants.rendererEvents.batchlabsLink, arg);
        }
    }
}
