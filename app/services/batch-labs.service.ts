import { Injectable } from "@angular/core";
import { AzureEnvironment } from "@batch-flask/core/azure-environment";
import { ElectronRemote } from "@batch-flask/ui";
import { BatchLabsApplication, FileSystem, LocalFileStorage } from "client/core";
import { AADService, AuthenticationWindow } from "client/core/aad";
import { PythonRpcServerProcess } from "client/python-process";
import { SplashScreen } from "client/splash-screen";
import { BatchLabsLink } from "common";
import { IpcEvent } from "common/constants";
import { AppUpdater } from "electron-updater";

@Injectable()
export class BatchLabsService {
    public pythonServer: PythonRpcServerProcess;
    public aadService: AADService;
    public autoUpdater: AppUpdater;
    /**
     * Root path of where BatchLabs is running.
     */
    public rootPath: string;

    /**
     * Version of BatchLabs
     */
    public version: string;

    /**
     * Points to the resource folder if running packaged app or the root of the app if in dev
     */
    public resourcesFolder: string;

    private _app: BatchLabsApplication;
    private _azureEnvironment: AzureEnvironment;

    constructor(private remote: ElectronRemote) {
        this._app = remote.getCurrentWindow().batchLabsApp;
        this._app.azureEnvironmentObs.subscribe((x) => {
            this._azureEnvironment = x;
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

    public openNewWindow(link: string | BatchLabsLink) {
        return this._app.openNewWindow(link);
    }

    public async logoutAndLogin() {
        return this.remote.send(IpcEvent.logoutAndLogin);
    }

    public async launchApplication(args): Promise<any> {
        return this.remote.send(IpcEvent.launchApplication, args);
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

    public getFileSystem(): FileSystem {
        return (this.getCurrentWindow() as any).fs;
    }

    public getLocalFileStorage(): LocalFileStorage {
        return (this.getCurrentWindow() as any).localFileStorage;
    }
}
