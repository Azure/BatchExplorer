import { app, dialog, ipcMain, session } from "electron";
import { AppUpdater, UpdateCheckResult, autoUpdater } from "electron-updater";
import * as os from "os";

import { BlIpcMain } from "client/core";
import { BatchLabsLink, Constants } from "common";
import { IpcEvent } from "common/constants";
import { Constants as ClientConstants } from "../client-constants";
import { logger } from "../logger";
import { MainWindow } from "../main-window";
import { PythonRpcServerProcess } from "../python-process";
import { RecoverWindow } from "../recover-window";
import { SplashScreen } from "../splash-screen";
import { AADService, AuthenticationWindow } from "./aad";
import { MainWindowManager } from "./main-window-manager";

const osName = `${os.platform()}-${os.arch()}/${os.release()}`;
const isDev = ClientConstants.isDev ? "-dev" : "";
const userAgent = `(${osName}) BatchLabs/${ClientConstants.version}${isDev}`;

export class BatchLabsApplication {
    public splashScreen = new SplashScreen(this);
    public authenticationWindow = new AuthenticationWindow(this);
    public recoverWindow = new RecoverWindow(this);
    public windows = new MainWindowManager(this);
    public pythonServer = new PythonRpcServerProcess();
    public aadService = new AADService(this);

    constructor(public autoUpdater: AppUpdater) {
        BlIpcMain.on(IpcEvent.AAD.accessTokenData, ({ tenantId, resource }) => {
            return this.aadService.accessTokenData(tenantId, resource);
        });
    }

    public async init() {
        await this.aadService.init();
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

        this.aadService.login();
        this.openFromArguments(process.argv);
    }

    public setupProcessEvents() {
        ipcMain.on("reload", () => {
            // Destroy window and error window if applicable
            this.windows.closeAll();
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
            if (this.windows.size === 0) {
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

    /**
     * Open a new link in the ms-batchlabs format
     * If the link provide a session id which already exists it will change the window with that session id.
     * @param link ms-batchlabs://...
     */
    public openLink(link: string | BatchLabsLink) {
        return this.windows.openLink(link);
    }

    /**
     * Open a new link in the ms-batchlabs format
     * @param link ms-batchlabs://...
     */
    public openNewWindow(link?: string | BatchLabsLink): MainWindow {
        return this.windows.openNewWindow(link);
    }

    public openFromArguments(argv: string[]) {
        if (ClientConstants.isDev || argv.length < 2) {
            this.openNewWindow();
            return;
        }

        const arg = argv[1];
        try {
            const link = new BatchLabsLink(arg);
            this.openLink(link);
        } catch (e) {
            dialog.showMessageBox({
                type: "error",
                title: "Cannot open given link in BatchLabs",
                message: e.message,
            }, () => {
                // If there is no window open we quit the app
                if (this.windows.size === 0) {
                    this.quit();
                }
            });
        }
    }

    public debugCrash() {
        this.windows.debugCrash();
    }

    public quit() {
        this.pythonServer.stop();
        app.quit();
    }

    public checkForUpdates(): Promise<UpdateCheckResult> {
        return autoUpdater.checkForUpdates();
    }

    private _registerProtocol() {
        if (ClientConstants.isDev) {
            return;
        }

        if (app.setAsDefaultProtocolClient(Constants.customProtocolName)) {
            logger.info(`Registered ${Constants.customProtocolName}:// as a protocol for batchlabs`);
        } else {
            logger.error(`Failed to register ${Constants.customProtocolName}:// as a protocol for batchlabs`);
        }
    }

}
