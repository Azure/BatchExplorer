import { Injectable } from "@angular/core";
import { AzureEnvironment } from "@batch-flask/core/azure-environment";
import { ElectronRemote } from "@batch-flask/ui";
import { BatchExplorerApplication, LocalFileStorage } from "client/core";
import { AADService, AuthenticationWindow } from "client/core/aad";
import { PythonRpcServerProcess } from "client/python-process";
import { SplashScreen } from "client/splash-screen";
import { BatchExplorerLink } from "common";
import { IpcEvent } from "common/constants";
import { AppUpdater } from "electron-updater";

@Injectable()
export class BatchExplorerService {
    public pythonServer: PythonRpcServerProcess;
    public aadService: AADService;
    public autoUpdater: AppUpdater;
    /**
     * Root path of where BatchExplorer is running.
     */
    public rootPath: string;

    /**
     * Version of BatchExplorer
     */
    public version: string;

    /**
     * Points to the resource folder if running packaged app or the root of the app if in dev
     */
    public resourcesFolder: string;

    private _app: BatchExplorerApplication;
    private _azureEnvironment: AzureEnvironment;

    constructor(private remote: ElectronRemote) {
        this._app = remote.getCurrentWindow().batchExplorerApp;
        this._app.properties.azureEnvironmentObs.subscribe((x) => {
            // Clone the environement to prevent calling the electron ipc sync for every key
            this._azureEnvironment = new AzureEnvironment(x);
        });
        this.autoUpdater = this._app.autoUpdater;
        this.aadService = this._app.aadService;
        this.pythonServer = this._app.pythonServer;
        this.rootPath = this._app.rootPath;
        this.version = this._app.version;
        this.resourcesFolder = this._app.resourcesFolder;
    }

    public get azureEnvironment() {
        return this._azureEnvironment;
    }

    public openNewWindow(link: string | BatchExplorerLink) {
        return this._app.openNewWindow(link);
    }

    public async logoutAndLogin() {
        return this.remote.send(IpcEvent.logoutAndLogin);
    }

    public async launchApplication(name: string, args: any): Promise<any> {
        return this.remote.send(IpcEvent.launchApplication, { name, args });
    }

    /**
     * @returns The BrowserWindow object which this web page belongs to.
     */
    public getCurrentWindow(): Electron.BrowserWindow {
        return this.remote.getCurrentWindow();
    }

    public getSplashScreen(): SplashScreen {
        return (this.getCurrentWindow() as any).splashScreen;
    }

    public getAuthenticationWindow(): AuthenticationWindow {
        return (this.getCurrentWindow() as any).authenticationWindow;
    }

    public getLocalFileStorage(): LocalFileStorage {
        return (this.getCurrentWindow() as any).localFileStorage;
    }
}
