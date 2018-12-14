import { Injectable, OnDestroy } from "@angular/core";
import { ProgressInfo } from "builder-util-runtime";
// Electron-updater has not sideEffects: false so it fail to tree shake
//  Make sure this file is not imported in Browser environment with export *
import { UpdateCheckResult, autoUpdater } from "electron-updater";
import { BehaviorSubject, Observable, Subscription, interval } from "rxjs";
import { map } from "rxjs/operators";
import { AutoUpdateService, UpdateStatus } from "./base";

export const AUTO_UPDATE_CHECK_INTERVAL = 3600_000; // Every hour

@Injectable()
export class AutoUpdateMainService extends AutoUpdateService implements OnDestroy {

    public set autoInstallOnAppQuit(value: boolean) {
        autoUpdater.autoInstallOnAppQuit = value;
    }

    /**
     * Will be set to true when there is an update available and it is ready to be installed(Downloaded)
     */
    public updateReady: Observable<boolean>;

    public disabled: boolean = false;
    private _status = new BehaviorSubject(UpdateStatus.Checking);
    private _autoCheckSub: Subscription;
    private _downloadProgress = new BehaviorSubject<ProgressInfo | null>(null);

    constructor() {
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
        this.updateInfo = null;
        this.downloadProgress = this._downloadProgress.asObservable();

        this._autoCheckSub = interval(3600_000).subscribe(() => {
            this.checkForUpdates();
        });

        this.updateReady = this._status.pipe(map(x => x === UpdateStatus.Ready));

        autoUpdater.on("checking-for-update", (info) => {
            this._status.next(UpdateStatus.Checking);
        });

        autoUpdater.on("update-available", (info) => {
            this._status.next(UpdateStatus.Downloading);
            this.updateInfo = info;
        });

        autoUpdater.on("download-progress", (progress) => {
            this._downloadProgress.next(progress);
            this._status.next(UpdateStatus.Downloading);
        });

        autoUpdater.on("update-downloaded", (info) => {
            this._status.next(UpdateStatus.Ready);
        });

        autoUpdater.on("update-not-available", (info) => {
            this._downloadProgress.next(null);
            this._status.next(UpdateStatus.NotAvailable);
        });
    }

    public ngOnDestroy() {
        this._autoCheckSub.unsubscribe();
        this._status.complete();
        this._downloadProgress.complete();
    }

    public async checkForUpdates(): Promise<UpdateCheckResult | null> {
        if (this.disabled) { return null; }
        const info = await autoUpdater.checkForUpdates();
        return this._status.value === UpdateStatus.Ready ? info : null;
    }

    public disable() {
        this.disabled = true;
        this._status.next(UpdateStatus.NotAvailable);
    }

    public quitAndInstall() {
        return autoUpdater.quitAndInstall();
    }

    /**
     * Set the feed url and trigger a refresh
     * @param url Url
     */
    public async setFeedUrl(url: string) {
        const current = autoUpdater.getFeedURL();
        if (current === url) { return; }
        autoUpdater.setFeedURL(url);
        return this.checkForUpdates();
    }
}
