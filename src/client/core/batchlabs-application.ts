import { app, ipcMain, session } from "electron";

import { AuthenticationWindow } from "../authentication";
import { Constants } from "../client-constants";
import { logger } from "../logger";
import { MainWindow } from "../main-window";
import { RecoverWindow } from "../recover-window";
import { SplashScreen } from "../splash-screen";

export class BatchLabsApplication {
    public splashScreen = new SplashScreen();
    public authenticationWindow = new AuthenticationWindow();
    public recoverWindow = new RecoverWindow();
    public mainWindow = new MainWindow();

    public init() {
        this.setupProcessEvents();
    }

    /**
     * Start the app by showing the splash screen
     */
    public start() {
        const requestFilter = { urls: ["https://*.batch.azure.com/*"] };
        session.defaultSession.webRequest.onBeforeSendHeaders(requestFilter, (details, callback) => {
            // Filter above doesn't seem to work
            if (details.url.indexOf("batch.azure.com") !== -1) {
                details.requestHeaders["Origin"] = "http://localhost";
                details.requestHeaders["Cache-Control"] = "no-cache";
            }
            details.requestHeaders["User-Agent"] = `BatchLabs/${Constants.version}`;

            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });

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
}
