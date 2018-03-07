import { Injectable } from "@angular/core";
import { AzureEnvironment } from "@batch-flask/core/azure-environment";
import { ElectronRemote } from "./electron/remote.service";

@Injectable()
export class BatchLabsService {
    private _azureEnvironment: AzureEnvironment;

    constructor(remote: ElectronRemote) {
        remote.getBatchLabsApp().azureEnvironmentObs.subscribe((x) => {
            this._azureEnvironment = x;
        });
    }

    public get azureEnvironment() {
        return this._azureEnvironment;
    }
}
