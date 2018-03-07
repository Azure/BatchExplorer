import * as commander from "commander";
import { app, dialog, ipcMain, session } from "electron";
import { AppUpdater, UpdateCheckResult, autoUpdater } from "electron-updater";
import * as os from "os";

import { AzureEnvironment, SupportedEnvironments } from "@batch-flask/core/azure-environment";
import { log } from "@batch-flask/utils";
import { BlIpcMain } from "client/core/bl-ipc-main";
import { localStorage } from "client/core/local-storage";
import { setMenu } from "client/menu";
import { ProxySettingsManager } from "client/proxy";
import { ProxyCredentialsWindow } from "client/proxy/proxy-credentials-window";
import { BatchLabsLink, Constants } from "common";
import { IpcEvent } from "common/constants";
import { ProxyCredentials } from "get-proxy-settings";
import { BehaviorSubject, Observable } from "rxjs";
import { Constants as ClientConstants } from "../client-constants";
import { MainWindow, WindowState } from "../main-window";
import { PythonRpcServerProcess } from "../python-process";
import { RecoverWindow } from "../recover-window";
import { AADService, AuthenticationState, AuthenticationWindow } from "./aad";
import { BatchLabsInitializer } from "./batchlabs-initializer";
import { MainWindowManager } from "./main-window-manager";

const osName = `${os.platform()}-${os.arch()}/${os.release()}`;
const isDev = ClientConstants.isDev ? "-dev" : "";
const userAgent = `(${osName}) BatchLabs/${ClientConstants.version}${isDev}`;

export enum BatchLabsState {
    Loading,
    Ready,
}

export class BatchLabsApplication {
    public authenticationWindow = new AuthenticationWindow(this);
    public recoverWindow = new RecoverWindow(this);
    public windows = new MainWindowManager(this);
    public pythonServer = new PythonRpcServerProcess();
    public aadService = new AADService(this);
    public state: Observable<BatchLabsState>;
    public proxySettings = new ProxySettingsManager(this, localStorage);

    public get azureEnvironment(): AzureEnvironment { return this._azureEnvironemnt.value; }
    public azureEnvironmentObs: Observable<AzureEnvironment>;

    private _azureEnvironemnt = new BehaviorSubject(AzureEnvironment.Azure);
    private _state = new BehaviorSubject<BatchLabsState>(BatchLabsState.Loading);

    constructor(public autoUpdater: AppUpdater) {
        this.state = this._state.asObservable();
        BlIpcMain.on(IpcEvent.AAD.accessTokenData, ({ tenantId, resource }) => {
            return this.aadService.accessTokenData(tenantId, resource);
        });
        this.azureEnvironmentObs = this._azureEnvironemnt.asObservable();
        this._loadAzureEnviornment();
    }

    public async init() {
        BlIpcMain.init();
        await this.aadService.init();
        this._registerProtocol();
        this._setupProcessEvents();
        await this.proxySettings.init();
    }

    /**
     * Start the app by showing the splash screen
     */
    public async start() {
        setMenu(this);

        const initializer = new BatchLabsInitializer(this);
        this.pythonServer.start();

        this._setCommonHeaders();
        initializer.setTaskStatus("login", "Login to azure active directory", 10);
        const loggedIn = this.aadService.login().then(() => {
            initializer.completeTask("login");
        });
        initializer.setTaskStatus("window", "Loading application");
        const window = this.openFromArguments(process.argv);
        const subs = [];
        subs.push(window.state.subscribe((state) => {
            switch (state) {
                case WindowState.Loading:
                    initializer.setTaskStatus("window", "Loading application");
                    break;
                case WindowState.Initializing:
                    initializer.setTaskStatus("window", "Initializing application");
                    break;
                case WindowState.FailedLoad:
                    initializer.setTaskStatus("window",
                        "Fail to load! Make sure you built the app or are running the dev-server.");
                    break;
                case WindowState.Ready:
                    initializer.completeTask("window");

            }
        }));
        subs.push(this.aadService.userAuthorization.state.subscribe((state) => {
            switch (state) {
                case AuthenticationState.Authenticated:
                    initializer.show();
                    break;
                case AuthenticationState.UserInput:
                    initializer.hide();
                    break;
                default:
                    break;

            }
        }));
        await Promise.all([loggedIn, window.appReady]);
        subs.forEach(x => x.unsubscribe());
        window.show();
        initializer.complete();
    }

    /**
     * Update the current azure environemnt.
     * Warning: This will log the user out and redirect him the the loging page.
     */
    public async updateAzureEnvironment(env: AzureEnvironment) {
        console.log("Changing environemnt", env.name);
        await this.aadService.logout();
        console.log("Logout done");
        localStorage.setItem(Constants.localStorageKey.azureEnvironment, env.id);
        this._azureEnvironemnt.next(env);
        await this.aadService.login();
        this.windows.showAll();
    }

    /**
     * Open a new link in the ms-batchlabs format
     * If the link provide a session id which already exists it will change the window with that session id.
     * @param link ms-batchlabs://...
     */
    public openLink(link: string | BatchLabsLink, show) {
        return this.windows.openLink(link);
    }

    /**
     * Open a new link in the ms-batchlabs format
     * @param link ms-batchlabs://...
     */
    public openNewWindow(link?: string | BatchLabsLink): MainWindow {
        return this.windows.openNewWindow(link);
    }

    public openFromArguments(argv: string[]): MainWindow {
        if (ClientConstants.isDev) {
            return this.windows.openNewWindow(null, false);
        }
        const program = commander
            .version(app.getVersion())
            .option("--updated", "If the application was just updated")
            .parse(["", ...argv]);
        const arg = program.args[0];
        if (!arg) {
            return this.windows.openNewWindow(null, false);
        }
        try {
            const link = new BatchLabsLink(arg);
            return this.openLink(link, false);
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

    public askUserForProxyCredentials(): Promise<ProxyCredentials> {
        const proxyCredentials = new ProxyCredentialsWindow(this);
        proxyCredentials.create();
        return proxyCredentials.credentials;
    }

    private _setupProcessEvents() {
        ipcMain.on("reload", () => {
            // Destroy window and error window if applicable
            this.windows.closeAll();
            this.recoverWindow.destroy();
            this.authenticationWindow.destroy();

            // Show splash screen
            this.start();
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
            log.error("There was a uncaught exception", error);
            this.recoverWindow.createWithError(error.message);
        });

        process.on("unhandledRejection", r => {
            log.error("Unhandled promise error:", r);
        });
        app.on("window-all-closed", () => {
            // Required or electron will close when closing last open window before next one open
        });

        app.on("login", async (event, webContents, request, authInfo, callback) => {
            event.preventDefault();
            try {
                const { username, password } = await this.proxySettings.credentials();
                callback(username, password);
            } catch (e) {
                log.error("Unable to retrieve credentials for proxy settings", e);
                this.quit();
            }
        });
    }

    private _registerProtocol() {
        if (ClientConstants.isDev) {
            return;
        }

        if (app.setAsDefaultProtocolClient(Constants.customProtocolName)) {
            log.info(`Registered ${Constants.customProtocolName}:// as a protocol for batchlabs`);
        } else {
            log.error(`Failed to register ${Constants.customProtocolName}:// as a protocol for batchlabs`);
        }
    }

    private _setCommonHeaders() {
        const requestFilter = { urls: ["https://*", "http://*"] };
        session.defaultSession.webRequest.onBeforeSendHeaders(requestFilter, (details, callback) => {
            if (details.url.indexOf("batch.azure.com") !== -1) {
                details.requestHeaders["Origin"] = "http://localhost";
                details.requestHeaders["Cache-Control"] = "no-cache";
            }
            details.requestHeaders["User-Agent"] = userAgent;
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });
    }

    private async _loadAzureEnviornment() {
        const initialEnv = await localStorage.getItem(Constants.localStorageKey.azureEnvironment);
        console.log("Initial env", initialEnv);
        if (initialEnv in SupportedEnvironments) {
            this._azureEnvironemnt.next(SupportedEnvironments[initialEnv]);
        }
    }
}
