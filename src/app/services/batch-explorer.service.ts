import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { ElectronRemote } from "@batch-flask/electron";
import { wrapMainObservable } from "@batch-flask/electron/utils";
import { AzureEnvironment } from "client/azure-environment";
import { BatchExplorerApplication } from "client/core";
import { AADService, AuthenticationWindow } from "client/core/aad";
import { PythonRpcServerProcess } from "client/python-process";
import { SplashScreen } from "client/splash-screen";
import { BatchExplorerLink } from "common";
import { IpcEvent } from "common/constants";
import { Observable, Subscription } from "rxjs";

@Injectable({ providedIn: "root" })
export class BatchExplorerService implements OnDestroy {
    public pythonServer: PythonRpcServerProcess;
    public aadService: AADService;
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
    public isOSHighContrast: Observable<boolean>;

    private _app: BatchExplorerApplication;
    private _azureEnvironment: AzureEnvironment;
    private _envSub: Subscription;

    constructor(private remote: ElectronRemote, zone: NgZone) {
        this._app = remote.getCurrentWindow().batchExplorerApp;
        this.isOSHighContrast = wrapMainObservable(this._app.properties.isOSHighContrast, zone);

        this._envSub = wrapMainObservable(this._app.properties.azureEnvironmentObs, zone).subscribe((x) => {
            // Clone the environement to prevent calling the electron ipc sync for every key
            this._azureEnvironment = { ...x };
        });
        this.aadService = this._app.aadService;
        this.pythonServer = this._app.pythonServer;
        this.rootPath = this._app.rootPath;
        this.version = this._app.version;
        this.resourcesFolder = this._app.resourcesFolder;
    }

    public ngOnDestroy() {
        this._envSub.unsubscribe();
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
}
