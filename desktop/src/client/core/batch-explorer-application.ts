import { Injectable, Injector } from "@angular/core";
import { LocaleService, TelemetryService, TranslationsLoaderService, UserConfigurationService } from "@batch-flask/core";
import { AutoUpdateService } from "@batch-flask/electron";
import { log } from "@batch-flask/utils";
import { AzureEnvironment } from "client/azure-environment";
import { parseArguments } from "client/cli";
import { BlIpcMain } from "client/core/bl-ipc-main";
import { BatchExplorerProperties } from "client/core/properties";
import { TelemetryManager } from "client/core/telemetry/telemetry-manager";
import { ManualProxyConfigurationWindow } from "client/proxy/manual-proxy-configuration-window";
import { ProxyCredentialsWindow } from "client/proxy/proxy-credentials-window";
import { ProxySettingsManager } from "client/proxy/proxy-settings";
import { BEUserConfiguration, BatchExplorerLink, Constants, Deferred } from "common";
import { IpcEvent } from "common/constants";
import { app, dialog, ipcMain, protocol, session } from "electron";
import { UpdateCheckResult } from "electron-updater";
import { ProxyCredentials, ProxySettings } from "get-proxy-settings";
import * as os from "os";
import { BehaviorSubject, Observable } from "rxjs";
import { Constants as ClientConstants } from "../client-constants";
import { MainWindow, WindowState } from "../main-window";
import { RecoverWindow } from "../recover-window";
import { AADService, AuthenticationWindow } from "./aad";
import { BatchExplorerInitializer } from "./batch-explorer-initializer";
import { MainWindowManager } from "./main-window-manager";
import { StorageBlobAdapter } from "./storage";
import { filter, first, map } from "rxjs/operators";

const osName = `${os.platform()}-${os.arch()}/${os.release()}`;
const isDev = ClientConstants.isDev ? "-dev" : "";
const userAgentSuffix = `(${osName}) BatchExplorer/${ClientConstants.version}${isDev}`;

export enum BatchExplorerState {
    Loading,
    Ready,
}

@Injectable()
export class BatchExplorerApplication {
    public authenticationWindow = new AuthenticationWindow(this);
    public recoverWindow = new RecoverWindow(this);
    public windows: MainWindowManager;
    public aadService: AADService;
    public state: Observable<BatchExplorerState>;
    public proxySettings: ProxySettingsManager;
    public userSettings: Observable<BEUserConfiguration>;
    public appReady: Deferred<void>;

    private _state = new BehaviorSubject<BatchExplorerState>(BatchExplorerState.Loading);
    private _initializer: BatchExplorerInitializer;
    private _currentlyAskingForCredentials: Promise<any> | null;
    private mainWindow: MainWindow;

    constructor(
        public autoUpdater: AutoUpdateService,
        public translationLoader: TranslationsLoaderService,
        public localeService: LocaleService,
        public injector: Injector,
        public ipcMain: BlIpcMain,
        public properties: BatchExplorerProperties,
        private telemetryService: TelemetryService,
        private telemetryManager: TelemetryManager,
        private storageBlobAdapter: StorageBlobAdapter,
        configurationStore: UserConfigurationService<BEUserConfiguration>
    ) {
        this.windows = new MainWindowManager(this, this.telemetryManager);
        this.state = this._state.asObservable();
        this.appReady = new Deferred<void>();

        this.userSettings = configurationStore.config;
    }

    public async init() {
        await this.telemetryManager.init();
        await this.properties.init();

        this.telemetryService.trackEvent({ name: Constants.TelemetryEvents.applicationStart });

        this._initializer = this.injector.get(BatchExplorerInitializer);
        this.aadService = this.injector.get(AADService);
        this.proxySettings = this.injector.get(ProxySettingsManager);

        this.ipcMain.init();
        await this.aadService.init();
        this._registerProtocol();
        this._setupProcessEvents();
        this._registerFileProtocol();
        await this.proxySettings.init();
        this._applyProxySettings();
        this.storageBlobAdapter.init();
    }

    /**
     * Start the app by showing the splash screen
     */
    public async start() {
        this._initializer.init();

        const window = await this.openFromArguments(process.argv, false);
        if (!window) { return; }

        this._setCommonHeaders(window);

        this._initializer.setTaskStatus("window", "Loading application");

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
                    this.appReady.resolve();
            }
        });
        await this.appReady.promise;

        this.ipcMain.on(IpcEvent.login, () => this.login());
        this.ipcMain.on(IpcEvent.logout, () => this.logout());

        windowSub.unsubscribe();

        window.show();
    }

    /**
     * Update the current azure environemnt.
     * Warning: This will log the user out and redirect him the the loging page.
     */
    public async updateAzureEnvironment(env: AzureEnvironment) {
        await this.aadService.logout();
        await this.properties.updateAzureEnvironment(env);
        await this.aadService.login().done;
        this.openMainWindow();
    }

    public logout() {
        return this.aadService.logout();
    }

    public async login() {
        await this.aadService.login().done;
        this.openMainWindow();
    }

    private openMainWindow(showWhenReady = true) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            if (!this.mainWindow.isVisible()) {
                this.mainWindow.show();
            }
        } else {
            this.mainWindow =
                this.windows.openNewWindow(undefined, showWhenReady);
        }
        return this.mainWindow;
    }

    /**
     * Open a new link in the ms-batch-explorer format
     * If the link provide a session id which already exists it will change the window with that session id.
     * @param link ms-batch-explorer://...
     */
    public openLink(link: string | BatchExplorerLink, show) {
        return this.windows.openLink(link);
    }

    /**
     * Open a new link in the ms-batch-explorer format
     * @param link ms-batch-explorer://...
     */
    public openNewWindow(link?: string | BatchExplorerLink): MainWindow {
        return this.windows.openNewWindow(link);
    }

    public async openFromArguments(argv: string[], showWhenReady = true): Promise<MainWindow | null> {
        if (ClientConstants.isDev) {
            return this.openMainWindow(showWhenReady);
        }
        const program = parseArguments(argv);
        const arg = program.args[0];
        if (!arg || arg.startsWith("data:")) {
            return this.openMainWindow(showWhenReady);
        }
        try {
            const link = new BatchExplorerLink(arg);
            return this.openLink(link, false);
        } catch (e) {
            await dialog.showMessageBox({
                type: "error",
                title: "Cannot open given link in BatchExplorer",
                message: e.message,
            });
            if (this.windows.size === 0) {
                this.quit();
            }
            return null;
        }
    }

    public debugCrash() {
        this.windows.debugCrash();
    }

    public quit() {
        app.quit();
    }

    public checkForUpdates(): Promise<UpdateCheckResult> {
        return this.autoUpdater.checkForUpdates();
    }

    public askUserForProxyCredentials(): Promise<ProxyCredentials> {
        log.warn("Asking for proxy credentials");
        if (this._currentlyAskingForCredentials) { return this._currentlyAskingForCredentials; }
        const proxyCredentials = new ProxyCredentialsWindow(this);
        proxyCredentials.create();
        this._currentlyAskingForCredentials = proxyCredentials.credentials;
        this._currentlyAskingForCredentials.then(() => {
            this._currentlyAskingForCredentials = null;
        }).catch(() => {
            this._currentlyAskingForCredentials = null;
        });
        return this._currentlyAskingForCredentials;
    }

    public askUserForProxyConfiguration(current?: ProxySettings | null): Promise<ProxySettings | null> {
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

    public async getUserSetting(key: keyof BEUserConfiguration):
    Promise<BEUserConfiguration[keyof BEUserConfiguration] | undefined> {
        const settingValue = this.userSettings.pipe(
            map(settings => settings[key]),
            filter(value => value !== undefined),
            first(),
        );
        return settingValue.toPromise();
    }

    public async sendIPCEvent(event: string, properties?: { [key: string]: string }): Promise<void> {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) {
            throw new Error("Main window is not available");
        }
        return this.mainWindow.webContents.send(event, properties);
    }

    public onIPCEvent(event: string, listener: (...args) => Promise<void>): () => void {
        const { unsubscribe } = this.ipcMain.on(event, listener);
        return unsubscribe;
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

        // eslint-disable-next-line @typescript-eslint/ban-types
        process.on("uncaughtException" as any, (error: Error) => {
            log.error("There was an uncaught exception", error);
            this.recoverWindow.createWithError(error.message);
            this.telemetryService.trackError(error);
            this.telemetryService.flush(true);
        });

        // eslint-disable-next-line @typescript-eslint/ban-types
        process.on("unhandledRejection", (r: Error) => {
            log.error("Unhandled promise error:", r);
            this.telemetryService.trackError(r);
            this.telemetryService.flush(true);
        });
        app.on("window-all-closed", () => {
            // Required or electron will close when closing last open window before next one open
        });

        app.on("login", async (event, webContents, request, authInfo, callback) => {
            event.preventDefault();
            log.info("Electron chromium process need browser credentials.");
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
            log.info(`Registered ${Constants.customProtocolName}:// as a protocol for Batch Explorer`);
        } else {
            log.error(`Failed to register ${Constants.customProtocolName}:// as a protocol for Batch Explorer`);
        }
        if (app.setAsDefaultProtocolClient(Constants.legacyProtocolName)) {
            log.info(`Registered ${Constants.legacyProtocolName}:// as a protocol for Batch Explorer`);
        } else {
            log.error(`Failed to register ${Constants.legacyProtocolName}:// as a protocol for Batch Explorer`);
        }
    }

    private _registerFileProtocol() {
        protocol.registerFileProtocol("file", (request, callback) => {
            const pathName = decodeURI(request.url.replace("file:///", ""));
            callback(pathName);
        });
    }

    private _setCommonHeaders(window: MainWindow) {
        const requestFilter = { urls: ["*://*/*"] };
        const userAgent = `${window.webContents.getUserAgent()} ${userAgentSuffix}`;
        session.defaultSession.webRequest.onBeforeSendHeaders(requestFilter, (details, callback) => {
            if (details.url.includes("batch.azure.com")) {
                details.requestHeaders["Origin"] = "http://localhost";
                details.requestHeaders["Cache-Control"] = "no-cache";
            }

            // Rate card api does some weird redirect which require removing the authorization header
            if (details.url.includes("ratecard.blob.core.windows.net")) {
                delete details.requestHeaders["Authorization"];
            }

            details.requestHeaders["User-Agent"] = userAgent;
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });
    }

    private async _trustedDomains(): Promise<string[]> {
        return [
            "https://raw.githubusercontent.com",
            "https://batch.azure.com", // Public data-plane API calls
            this.properties.azureEnvironment.aadUrl,
            this.properties.azureEnvironment.arm,
            this.properties.azureEnvironment.batch,
            this.properties.azureEnvironment.msGraph,
            this.properties.azureEnvironment.storageEndpoint
        ].map(url => {
            try {
                // Ensure the URL has a protocol (default to "https://")
                const normalized = url.startsWith("http") ? url : `https://${url}`;
                return new URL(normalized).hostname;
            } catch (error) {
                console.error(`Invalid URL: ${url}`, error);
                return null; // Handle invalid URLs gracefully
            }
        }).filter(Boolean);
    }

    private async _applyProxySettings() {
        const settings = await this.proxySettings.settings;

        const conf = settings.http || settings.https;
        const proxyUrl = `${conf.protocol}://${conf.host}:${conf.port}`;

        session.defaultSession.setProxy({ proxyRules: proxyUrl });

        const trustedDomains = await this._trustedDomains();
        session.defaultSession.setCertificateVerifyProc((request, verifyCert) => {
            if (trustedDomains.some(host => request.hostname.includes(host))) {
                verifyCert(0); // trust the certificate
            } else {
                console.error("Untrusted certificate", request.hostname);
                verifyCert(-3);
            }
        });
    }
}
