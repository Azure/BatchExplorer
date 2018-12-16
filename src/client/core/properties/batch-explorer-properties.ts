import { Injectable } from "@angular/core";
import { DataStore } from "@batch-flask/core";
import { AzureEnvironment, SupportedEnvironments } from "@batch-flask/core/azure-environment";
import { Constants } from "common";
import { systemPreferences } from "electron";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class BatchExplorerProperties {
    public get azureEnvironment(): AzureEnvironment { return this._azureEnvironment.value; }
    public azureEnvironmentObs: Observable<AzureEnvironment>;

    public isOSHighContrast: Observable<boolean>;

    private _azureEnvironment = new BehaviorSubject(AzureEnvironment.Azure);
    private _isOSHighContrast = new BehaviorSubject(false);

    constructor(private store: DataStore) {
        this.isOSHighContrast = this._isOSHighContrast.asObservable();
        this._isOSHighContrast.next(systemPreferences.isInvertedColorScheme());
        systemPreferences.on("inverted-color-scheme-changed", () => {
            this._isOSHighContrast.next(systemPreferences.isInvertedColorScheme());
        });
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
        if (initialEnv && initialEnv in SupportedEnvironments) {
            this._azureEnvironment.next(SupportedEnvironments[initialEnv]);
        }
    }
}
