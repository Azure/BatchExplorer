import * as commander from "commander";
import { app, dialog, ipcMain, session } from "electron";
import { AppUpdater, UpdateCheckResult, autoUpdater } from "electron-updater";
import * as os from "os";

import { AzureEnvironment, SupportedEnvironments } from "@batch-flask/core/azure-environment";
import { OSService } from "@batch-flask/ui/electron";
import { fetch, log } from "@batch-flask/utils";
import { BlIpcMain } from "client/core/bl-ipc-main";
import { FileSystem } from "client/core/fs";
import { localStorage } from "client/core/local-storage";
import { TerminalService } from "client/core/terminal";
import { setMenu } from "client/menu";
import { ProxySettingsManager } from "client/proxy";
import { ManualProxyConfigurationWindow } from "client/proxy/manual-proxy-configuration-window";
import { ProxyCredentialsWindow } from "client/proxy/proxy-credentials-window";
import { BatchLabsLink, Constants, Deferred } from "common";
import { Application, IpcEvent } from "common/constants";
import { ProxyCredentials, ProxySettings } from "get-proxy-settings";
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
    public terminalService = new TerminalService(new OSService(), new FileSystem());
    public state: Observable<BatchLabsState>;
    public proxySettings = new ProxySettingsManager(this, localStorage);

    public get azureEnvironment(): AzureEnvironment { return this._azureEnvironment.value; }
    public azureEnvironmentObs: Observable<AzureEnvironment>;

    private _azureEnvironment = new BehaviorSubject(AzureEnvironment.Azure);
    private _state = new BehaviorSubject<BatchLabsState>(BatchLabsState.Loading);
    private _initializer = new BatchLabsInitializer(this);

    constructor(public autoUpdater: AppUpdater) {
        this.state = this._state.asObservable();
        BlIpcMain.on(IpcEvent.AAD.accessTokenData, ({ tenantId, resource }) => {
            return this.aadService.accessTokenData(tenantId, resource);
        });
        BlIpcMain.on(IpcEvent.fetch, async ({ url, options }) => {
            const response = await  fetch(url, options);
            return {
                status: response.status,
                statusText: response.statusText,
            };
        });
        BlIpcMain.on(IpcEvent.logoutAndLogin, () => {
            return this.logoutAndLogin();
        });
        BlIpcMain.on(IpcEvent.launchApplication, (args) => {
            if (args.name === Application.terminal) {
                return this.terminalService.runInTerminal(args.command);
            }
        });
        this.azureEnvironmentObs = this._azureEnvironment.asObservable();
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
        const appReady = new Deferred();
        const loggedIn = new Deferred();
        this.pythonServer.start();
        this._initializer.init();

        this._setCommonHeaders();
        this.aadService.login();
        this._initializer.setTaskStatus("window", "Loading application");
        const window = this.openFromArguments(process.argv, false);
        const windowSub = window.state.subscribe((state) => {
            switch (state) {
                case WindowState.Loading:
                    this._initializer.setTaskStatus("window", "Loading application");
                    break;
                case WindowState.Initializing:
                    this._initializer.setTaskStatus("window", "Initializing application");
                    break;
                case WindowState.FailedLoad:
                    this._initializer.setTaskStatus("window",
                        "Fail to load! Make sure you built the app or are running the dev-server.");
                    break;
                case WindowState.Ready:
                    this._initializer.completeTask("window");
                    windowSub.unsubscribe();
                    appReady.resolve();
            }
        });
        const authSub = this.aadService.authenticationState.subscribe((state) => {
            switch (state) {
                case AuthenticationState.None:
                    this._initializer.setLoginStatus("Login to azure active directory");
                    break;
                case AuthenticationState.UserInput:
                    this._initializer.setLoginStatus("Prompting for user input");
                    break;
                case AuthenticationState.Authenticated:
                    this._initializer.completeLogin();
                    authSub.unsubscribe();
                    loggedIn.resolve();
                    break;

            }
        });
        await Promise.all([appReady.promise, loggedIn.promise]);
        window.show();
    }

    /**
     * Update the current azure environemnt.
     * Warning: This will log the user out and redirect him the the loging page.
     */
    public async updateAzureEnvironment(env: AzureEnvironment) {
        await this.aadService.logout();
        localStorage.setItem(Constants.localStorageKey.azureEnvironment, env.id);
        this._azureEnvironment.next(env);
        await this.aadService.login();
        this.windows.openNewWindow();
    }

    public async logoutAndLogin() {
        await this.aadService.logout();
        await this.aadService.login();
        this.windows.openNewWindow();
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

    public openFromArguments(argv: string[], showWhenReady = true): MainWindow {
        if (ClientConstants.isDev) {
            return this.windows.openNewWindow(null, showWhenReady);
        }
        const program = commander
            .version(app.getVersion())
            .option("--updated", "If the application was just updated")
            .parse(["", ...argv]);
        const arg = program.args[0];
        if (!arg) {
            return this.windows.openNewWindow(null, showWhenReady);
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

    public restart() {
        app.relaunch();
        app.exit();
    }

    public askUserForProxyCredentials(): Promise<ProxyCredentials> {
        const proxyCredentials = new ProxyCredentialsWindow(this);
        proxyCredentials.create();
        return proxyCredentials.credentials;
    }

    public askUserForProxyConfiguration(current?: ProxySettings): Promise<ProxySettings> {
        const proxyCredentials = new ManualProxyConfigurationWindow(this, current);
        proxyCredentials.create();
        return proxyCredentials.settings;
    }

    public get rootPath() {
        return ClientConstants.root;
    }

    public get resourcesFolder() {
        return ClientConstants.resourcesFolder;
    }

    public get version() {
        return app.getVersion();
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
            if (details.url.includes("batch.azure.com")) {
                details.requestHeaders["Origin"] = "http://localhost";
                details.requestHeaders["Cache-Control"] = "no-cache";
            }

            // Rate card api does some weird redirect which require removing the authorization header
            if (details.url.includes("ratecard.blob.core.windows.net")) {
                delete details.requestHeaders.Authorization;
            }

            details.requestHeaders["User-Agent"] = userAgent;
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });
    }

    private async _loadAzureEnviornment() {
        const initialEnv = await localStorage.getItem(Constants.localStorageKey.azureEnvironment);
        if (initialEnv in SupportedEnvironments) {
            this._azureEnvironment.next(SupportedEnvironments[initialEnv]);
        }
    }
}
