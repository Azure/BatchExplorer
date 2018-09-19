import { Injectable, OnDestroy } from "@angular/core";
import { TelemetryService } from "@batch-flask/core";
import { exists } from "@batch-flask/utils";
import { ClientConstants } from "client/client-constants";
import { BatchExplorerProcess } from "client/core/batch-explorer-process";
import { BlIpcMain } from "client/core/bl-ipc-main";
import { LocalDataStore } from "client/core/local-data-store";
import { Constants } from "common";
import { Subscription } from "rxjs";

@Injectable()
export class TelemetryManager implements OnDestroy {
    /**
     * Value for the user setting
     */
    public userTelemetryEnabled: boolean;
    public _subs: Subscription[] = [];

    /**
     * Event if the user has telemetry enabled, we disable telemtry in the dev version.
     */
    public get telemetryEnabled() {
        // const dev = ClientConstants.isDev;
        const dev = false;
        return this.userTelemetryEnabled && !dev;
    }

    constructor(
        private telemetryService: TelemetryService,
        private dataStore: LocalDataStore,
        private batchExplorerProcess: BatchExplorerProcess,
        ipcMain: BlIpcMain) {

        this._subs.push(ipcMain.on(Constants.IpcEvent.sendTelemetry, ({ telemetry, type }) => {
            this.telemetryService.track(telemetry, type);
            return Promise.resolve();
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public async init() {
        await this._loadUserSettings();
        this.telemetryService.init(this.telemetryEnabled);
    }

    public async enableTelemetry() {
        this.userTelemetryEnabled = true;
        await this.dataStore.setItem(Constants.localStorageKey.telemetryEnabled, true);
        this.batchExplorerProcess.restart();
    }

    /**
     * Disable telemetry and save the setting. Then restart the application
     */
    public async disableTelemetry() {
        this.userTelemetryEnabled = false;
        this.telemetryService.trackEvent({ name: Constants.TelemetryEvents.disableTelemetry });
        await this.telemetryService.flush();
        await this.dataStore.setItem(Constants.localStorageKey.telemetryEnabled, false);
        this.batchExplorerProcess.restart();
    }

    private async _loadUserSettings() {
        const userSetting = await this.dataStore.getItem<boolean>(Constants.localStorageKey.telemetryEnabled);
        this.userTelemetryEnabled = exists(userSetting) ? userSetting : true;
    }
}
