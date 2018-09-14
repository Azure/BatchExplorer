import { Injectable, OnDestroy } from "@angular/core";
import { AutoUpdateService, ElectronRemote } from "@batch-flask/ui";
import { SettingsService } from "app/services/settings.service";
import { Constants } from "common";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

export enum VersionType {
    Stable = "stable",
    Insider = "insider",
    Test = "test",
    Dev = "dev",
}

const versionRegex = /\d\.\d\.\d\-([a-z]+)(\.\d+)?/;

@Injectable()
export class VersionService implements OnDestroy {
    public version: string;

    /**
     * What
     */
    public versionType: VersionType;

    public updateChannel: Observable<VersionType>;

    private _updateChannel = new BehaviorSubject<VersionType>(null);
    private _sub: Subscription;

    constructor(
        private autoUpdateService: AutoUpdateService,
        remote: ElectronRemote,
        settingsService: SettingsService) {
        const app = remote.getCurrentWindow().batchExplorerApp;
        this.version = app.version;
        this.versionType = this._resolveVersionChannel();
        this.updateChannel = this._updateChannel.asObservable();

        this._sub = settingsService.settingsObs.subscribe((settings) => {
            this._updateAutoUpdateChannel(settings["update.channel"]);
        });
    }

    public ngOnDestroy() {
        this._updateChannel.complete();
        this._sub.unsubscribe();
    }

    private _updateAutoUpdateChannel(channel: string | null) {
        // Don't try to set update url when in dev mode
        if (this.versionType !== VersionType.Dev) {
            this.autoUpdateService.setFeedUrl(this._getAutoUpdateChannel(channel));
        }
    }

    private _getAutoUpdateChannel(channel: string | null) {
        switch (channel) {
            case VersionType.Insider:
                return Constants.AutoUpdateUrls.insider;
            case VersionType.Test:
                return Constants.AutoUpdateUrls.test;
            default:
                return Constants.AutoUpdateUrls.stable;
        }
    }

    private _resolveVersionChannel(): VersionType {
        const match = versionRegex.exec(this.version);
        if (match && match.length >= 2) {
            if (Object.values(VersionType).includes(match[1])) {
                return match[1] as VersionType;
            }
        }
        return VersionType.Dev;
    }
}
