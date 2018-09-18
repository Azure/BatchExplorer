import { Injectable } from "@angular/core";
import { TelemetryService } from "@batch-flask/core";
import { exists } from "@batch-flask/utils";
import { LocalDataStore } from "client/core/local-data-store";
import { Constants } from "common";
import { app } from "electron";

@Injectable()
export class TelemetryManager {
    /**
     * Value for the user setting
     */
    public userTelemetryEnabled: boolean;

    /**
     * Event if the user has telemetry enabled, we disable telemtry in the dev version.
     */
    public telemetryEnabled: boolean;

    constructor(private telemetryService: TelemetryService, private dataStore: LocalDataStore) {

    }

    public async init() {
        await this._loadUserSettings();
    }

    public enableTelemetry() {
        this.telemetryEnabled = true;
        this.dataStore.setItem(Constants.localStorageKey.telemetryEnabled, true);
        this._restart();
    }

    /**
     * Disable telemetry and save the setting. Then restart the application
     */
    public async disableTelemetry() {
        this.telemetryEnabled = false;
        this.telemetryService.trackEvent({ name: Constants.TelemetryEvents.disableTelemetry });
        await this.telemetryService.flush();
        this.dataStore.setItem(Constants.localStorageKey.telemetryEnabled, false);
        this._restart();
    }

    private _restart() {
        app.relaunch();
        app.quit();
    }

    private async _loadUserSettings() {
        const userSetting = await this.dataStore.getItem<boolean>(Constants.localStorageKey.telemetryEnabled);
        this.userTelemetryEnabled = exists(userSetting) ? userSetting : true;
        // const dev = ClientConstants.isDev;
        const dev = false;
        this.telemetryEnabled = this.userTelemetryEnabled && !dev;
        this.telemetryService.init(this.telemetryEnabled);
    }
}
