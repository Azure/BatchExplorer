import { Injectable } from "@angular/core";
import { AzureEnvironment } from "@batch-flask/core/azure-environment";
import { BatchLabsApplication } from "client/core";
import { ElectronRemote } from "./electron/remote.service";

@Injectable()
export class BatchLabsService {
    private _app: BatchLabsApplication;
    private _azureEnvironment: AzureEnvironment;

    constructor(remote: ElectronRemote) {
        this._app = remote.getBatchLabsApp();
        this._app.azureEnvironmentObs.subscribe((x) => {
            this._azureEnvironment = x;
        });
    }

    public get azureEnvironment() {
        return this._azureEnvironment;
    }

    public logoutAndLogin() {
        setImmediate(() => {
            this._app.logoutAndLogin();
        });
    }
}
