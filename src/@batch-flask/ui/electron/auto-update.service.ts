import { Injectable } from "@angular/core";
import { AppUpdater, UpdateCheckResult, UpdateInfo } from "electron-updater";
import { BehaviorSubject, Observable } from "rxjs";

import { BatchFlaskSettingsService } from "@batch-flask/ui/batch-flask-settings";
import { ElectronRemote } from "./remote.service";

export enum UpdateStatus {
    Checking,
    Downloading,
    Ready,
    NotAvailable,
}

@Injectable()
export class AutoUpdateService {
    /**
     * Will be set to true if there is an update available
     */
    public status: Observable<UpdateStatus>;

    /**
     * Will be set to true when there is an update available and it is ready to be installed(Downloaded)
     */
    public updateReady: Observable<boolean>;
    public updateInfo: UpdateInfo = null;
    private _status = new BehaviorSubject(UpdateStatus.Checking);
    private _autoUpdater: AppUpdater;

    constructor(batchFlaskSettings: BatchFlaskSettingsService, remote: ElectronRemote) {
        this._autoUpdater = remote.getCurrentWindow().autoUpdater;
        this.status = this._status.asObservable();
        this.updateReady = this._status.map(x => x === UpdateStatus.Ready);

        this._autoUpdater.on("checking-for-update", (info) => {
            this._status.next(UpdateStatus.Checking);
        });

        this._autoUpdater.on("update-available", (info) => {
            this._status.next(UpdateStatus.Downloading);
            this.updateInfo = info;
        });

        this._autoUpdater.on("download-progress", (progress) => {
            this._status.next(UpdateStatus.Ready);
        });

        this._autoUpdater.on("update-downloaded", (info) => {
            this._status.next(UpdateStatus.Ready);
        });

        this._autoUpdater.on("update-not-available", (info) => {
            this._status.next(UpdateStatus.NotAvailable);
        });

        batchFlaskSettings.settingsObs.subscribe((settings) => {
            this._autoUpdater.autoInstallOnAppQuit = Boolean(settings.autoUpdateOnQuit);
        });
    }

    public async checkForUpdates(): Promise<UpdateCheckResult | null> {
        const info = await this._autoUpdater.checkForUpdates();
        return this._status.value === UpdateStatus.Ready ? info : null;
    }

    public quitAndInstall() {
        return this._autoUpdater.quitAndInstall();
    }

    public set autoInstallOnAppQuit(value: boolean) {
        this._autoUpdater.autoInstallOnAppQuit = value;
    }
}
