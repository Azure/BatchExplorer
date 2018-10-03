import { Injectable, OnDestroy } from "@angular/core";
import { BatchFlaskSettingsService } from "@batch-flask/ui/batch-flask-settings";
import { AppUpdater, UpdateCheckResult, UpdateInfo } from "electron-updater";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { AutoUpdateService, UpdateStatus } from "./base";

@Injectable()
export class AutoUpdateMainService extends AutoUpdateService implements OnDestroy {

    public set autoInstallOnAppQuit(value: boolean) {
        this._autoUpdater.autoInstallOnAppQuit = value;
    }
    /**
     * Will be set to true if there is an update available
     */
    public status: Observable<UpdateStatus>;

    /**
     * Will be set to true when there is an update available and it is ready to be installed(Downloaded)
     */
    public updateReady: Observable<boolean>;
    public updateInfo: UpdateInfo = null;
    public disabled: boolean = false;
    private _status = new BehaviorSubject(UpdateStatus.Checking);
    private _autoUpdater: AppUpdater;
    private _settingsSub: Subscription;

    constructor(batchFlaskSettings: BatchFlaskSettingsService) {
        super();
        this.status = this._status.pipe(
            map((status) => {
                if (this.disabled) {
                    return UpdateStatus.NotAvailable;
                } else {
                    return status;
                }
            }),
        );
        this.updateReady = this._status.pipe(map(x => x === UpdateStatus.Ready));

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

        this._settingsSub = batchFlaskSettings.settingsObs.subscribe((settings) => {
            this._autoUpdater.autoInstallOnAppQuit = Boolean(settings.autoUpdateOnQuit);
        });
    }

    public ngOnDestroy() {
        this._settingsSub.unsubscribe();
    }

    public async checkForUpdates(): Promise<UpdateCheckResult | null> {
        if (this.disabled) { return; }
        const info = await this._autoUpdater.checkForUpdates();
        return this._status.value === UpdateStatus.Ready ? info : null;
    }

    public disable() {
        this.disabled = true;
        this._status.next(UpdateStatus.NotAvailable);
    }

    public quitAndInstall() {
        return this._autoUpdater.quitAndInstall();
    }

    /**
     * Set the feed url and trigger a refresh
     * @param url Url
     */
    public async setFeedUrl(url: string) {
        const current = this._autoUpdater.getFeedURL();
        if (current === url) { return; }
        this._autoUpdater.setFeedURL(url);
        return this.checkForUpdates();
    }
}
