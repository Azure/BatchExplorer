import { Injectable } from "@angular/core";
import { AzureEnvironment } from "@batch-flask/core/azure-environment";
import { BatchLabsApplication } from "client/core";
import { IpcEvent } from "common/constants";
import { ElectronRemote } from "./electron/remote.service";

@Injectable()
export class BatchLabsService {
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
        this._app = remote.getBatchLabsApp();
        this._app.azureEnvironmentObs.subscribe((x) => {
            this._azureEnvironment = x;
        });
        this.rootPath = this._app.rootPath;
        this.version = this._app.version;
        this.resourcesFolder = this._app.resourcesFolder;
    }

    public get azureEnvironment() {
        return this._azureEnvironment;
    }

    public async logoutAndLogin() {
        return this.remote.send(IpcEvent.logoutAndLogin);
    }
}
