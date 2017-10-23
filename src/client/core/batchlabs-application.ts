import { app, ipcMain } from "electron";
import { AppUpdater, UpdateCheckResult, autoUpdater } from "electron-updater";

import { AuthenticationWindow } from "../authentication";
import { logger } from "../logger";
import { MainWindow } from "../main-window";
import { RecoverWindow } from "../recover-window";
import { SplashScreen } from "../splash-screen";

export class BatchLabsApplication {
    public splashScreen = new SplashScreen(this);
    public authenticationWindow = new AuthenticationWindow(this);
    public recoverWindow = new RecoverWindow(this);
    public mainWindow = new MainWindow(this);

    constructor(public autoUpdater: AppUpdater) { }

    public init() {
        this.setupProcessEvents();
    }

    /**
     * Start the app by showing the splash screen
     */
    public start() {
        this.splashScreen.create();
        this.splashScreen.updateMessage("Loading app");

        this.mainWindow.create();
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
        app.quit();
    }

    public checkForUpdates(): Promise<UpdateCheckResult> {
        return autoUpdater.checkForUpdates();
    }
}
