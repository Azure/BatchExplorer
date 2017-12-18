import { app, ipcMain, session } from "electron";
import { AppUpdater, UpdateCheckResult, autoUpdater } from "electron-updater";
import * as os from "os";
import * as Url from "url";

import { Constants } from "../client-constants";
import { logger } from "../logger";
import { MainWindow } from "../main-window";
import { PythonRpcServerProcess } from "../python-process";
import { RecoverWindow } from "../recover-window";
import { SplashScreen } from "../splash-screen";
import { AADService, AuthenticationWindow } from "./aad";

const osName = `${os.platform()}-${os.arch()}/${os.release()}`;
const isDev = Constants.isDev ? "-dev" : "";
const userAgent = `(${osName}) BatchLabs/${Constants.version}${isDev}`;

export class BatchLabsApplication {
    public splashScreen = new SplashScreen(this);
    public authenticationWindow = new AuthenticationWindow(this);
    public recoverWindow = new RecoverWindow(this);
    public windows = [new MainWindow(this)];
    public pythonServer = new PythonRpcServerProcess();
    public aadService = new AADService(this);

    constructor(public autoUpdater: AppUpdater) {
        logger.info("Arguments", process.argv);
    }

    public init() {
        this.aadService.init();
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

        this.windows.forEach(x => x.create());
        this.aadService.login();
        this._processArguments(process.argv);
    }

    public setupProcessEvents() {
        ipcMain.on("reload", () => {
            // Destroy window and error window if applicable
            this.windows.forEach(x => x.destroy());
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
            // TODO-TIM check that
            // if (!this.mainWindow.exists()) {
            //     this.start();
            // }
        });

        ipcMain.once("exit", () => {
            process.exit(1);
        });

        process.on("uncaughtException" as any, (error: Error) => {
            logger.error("There was a uncaught exception", error);
            this.recoverWindow.createWithError(error.message);
        });

    }

    /**
     * Open a new link in the ms-batchlabs format
     * @param link ms-batchlabs://...
     */
    public openNewWindow(link: string): MainWindow {
        const window = new MainWindow(this);
        window.create();
        window.send(Constants.rendererEvents.batchlabsLink, link);
        this.windows.push(window);
        return window;
    }

    public debugCrash() {
        this.windows.forEach(x => x.debugCrash());
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
            this.windows[0].send(Constants.rendererEvents.batchlabsLink, arg);
        }
    }
}
