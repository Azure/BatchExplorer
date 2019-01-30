import { Injectable, OnDestroy } from "@angular/core";
import { UserConfigurationService } from "@batch-flask/core";
import { AutoUpdateService, ElectronRemote } from "@batch-flask/electron";
import { Constants } from "common";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { BEUserDesktopConfiguration } from "../user-configuration";

export enum VersionType {
    Stable = "stable",
    Insider = "insider",
    Testing = "testing",
    Dev = "dev",
}

const versionRegex = /\d+\.\d+\.\d+\-([a-z]+)(\.\d+)?/;

@Injectable({providedIn: "root"})
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
        settingsService: UserConfigurationService<BEUserDesktopConfiguration>) {
        const app = remote.getCurrentWindow().batchExplorerApp;
        this.version = app.version;
        this.versionType = this._resolveVersionChannel();
        this.updateChannel = this._updateChannel.asObservable();

        if (this.versionType === VersionType.Dev) {
            this.autoUpdateService.disable();
        }

        this._sub = settingsService.watch("update").subscribe((settings) => {
            this._updateAutoUpdateChannel(settings.channel);
        });
    }

    public ngOnDestroy() {
        this._updateChannel.complete();
        this._sub.unsubscribe();
    }

    private _updateAutoUpdateChannel(channel: string | null) {
        this._updateChannel.next(this._getAutoUpdateChannel(channel));
        // Don't try to set update url when in dev mode
        this.autoUpdateService.setFeedUrl(this._getChannelUrl());
    }

    private _getChannelUrl() {
        const type = this._updateChannel.value;
        return Constants.AutoUpdateUrls[type] || Constants.AutoUpdateUrls.stable;
    }

    private _getAutoUpdateChannel(channel: string | null): VersionType {
        switch (channel) {
            case VersionType.Insider:
            case VersionType.Testing:
            case VersionType.Stable:
                return channel;
            default:
                return this._getDefaultChannel();
        }
    }

    private _getDefaultChannel() {
        switch (this.versionType) {
            case VersionType.Stable:
            case VersionType.Insider:
            case VersionType.Testing:
                return this.versionType;
            default:
                return VersionType.Stable;
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
