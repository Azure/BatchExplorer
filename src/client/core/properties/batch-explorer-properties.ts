import { Injectable } from "@angular/core";
import { DataStore } from "@batch-flask/core";
import { AzureEnvironment, SupportedEnvironments } from "@batch-flask/core/azure-environment";
import { Constants } from "common";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class BatchExplorerProperties {
    public get azureEnvironment(): AzureEnvironment { return this._azureEnvironment.value; }
    public azureEnvironmentObs: Observable<AzureEnvironment>;

    private _azureEnvironment = new BehaviorSubject(AzureEnvironment.Azure);

    constructor(private store: DataStore) {
        this.azureEnvironmentObs = this._azureEnvironment.asObservable();
    }

    public async init() {
        return this._loadAzureEnvironment();
    }

    /**
     * Update the current azure environemnt.
     * Warning: This will log the user out and redirect him the the loging page.
     */
    public async updateAzureEnvironment(env: AzureEnvironment) {
        await this.store.setItem(Constants.localStorageKey.azureEnvironment, env.id);
        this._azureEnvironment.next(env);
    }

    private async _loadAzureEnvironment() {
        const initialEnv = await this.store.getItem(Constants.localStorageKey.azureEnvironment);
        if (initialEnv in SupportedEnvironments) {
            this._azureEnvironment.next(SupportedEnvironments[initialEnv]);
        }
    }
}
