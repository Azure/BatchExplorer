import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { BatchFlaskSettingsService } from "@batch-flask/ui/batch-flask-settings";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
// tslint:disable-next-line:no-var-requires
const stripJsonComments = require("strip-json-comments");

import { AutoUpdateService } from "@batch-flask/ui";
import { log } from "@batch-flask/utils";
import { KeyBindings, Settings, defaultKeybindings } from "app/models";
import { Constants } from "common";
import { catchError, filter } from "rxjs/operators";
import { LocalFileStorage } from "./local-file-storage.service";

// tslint:disable-next-line:no-var-requires
const defaultSettings = JSON.parse(stripJsonComments(require("app/components/settings/default-settings.json")));

@Injectable()
export class SettingsService implements OnDestroy {
    public settingsObs: Observable<Settings>;
    public keybindings: Observable<KeyBindings[]>;

    public hasSettingsLoaded: Observable<boolean>;
    public settings: Settings;
    public userSettingsStr: string;

    private _hasSettingsLoaded = new BehaviorSubject<boolean>(false);
    private _settingsSubject = new BehaviorSubject<Settings>(null);
    private _keybindings = new BehaviorSubject<KeyBindings[]>(null);

    private _filename = "settings";
    private _keybindingsFilename = "keybindings";
    private _sub: Subscription;

    constructor(
        private zone: NgZone,
        private storage: LocalFileStorage,
        private autoUpdateService: AutoUpdateService,
        batchFlaskSettings: BatchFlaskSettingsService) {
        this.settingsObs = this._settingsSubject.pipe(filter(x => Boolean(x)));
        this.keybindings = this._keybindings.pipe(filter(x => Boolean(x)));
        this.hasSettingsLoaded = this._hasSettingsLoaded.asObservable();
        this._sub = this.settingsObs.subscribe((settings) => {
            batchFlaskSettings.updateSettings({
                entityConfiguration: {
                    defaultView: settings["configuration.default-view"],
                },
                autoUpdateOnQuit: settings["auto-update-on-quit"],
                fileTypes: settings.fileTypes,
            });
            this._updateAutoUpdateChannel(settings["update.channel"]);
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public init() {
        this.loadSettings();
    }

    public saveUserSettings(userSettings: string): Observable<any> {
        this.userSettingsStr = userSettings;
        this.settings = { ...defaultSettings, ...this._parseUserSettings(userSettings) };
        this._settingsSubject.next(this.settings);
        return this.storage.write(this._filename, userSettings);
    }

    private _updateAutoUpdateChannel(channel: string | null) {
        this.autoUpdateService.setFeedUrl(this._getAutoUpdateChannel(channel));
    }

    private _getAutoUpdateChannel(channel: string | null) {
        switch (channel) {
            case "insider":
                return Constants.AutoUpdateUrls.insider;
            case "test":
                return Constants.AutoUpdateUrls.test;
            case "stable":
            default:
                return Constants.AutoUpdateUrls.stable;
        }
    }

    private loadSettings() {
        this.storage.read(this._filename).pipe(
            catchError((error) => {
                log.error("Error loading user settings", error);
                return null;
            }),
        ).subscribe((userSettings: string) => {
            this.userSettingsStr = userSettings;
            this.settings = { ...defaultSettings, ...this._parseUserSettings(userSettings) };
            this._hasSettingsLoaded.next(true);
            this._settingsSubject.next(this.settings);
        });

        this.storage.get(this._keybindingsFilename).subscribe((data: KeyBindings[]) => {
            this.zone.run(() => {
                // If the file has never been init create it
                if (!Array.isArray(data)) {
                    this.storage.set(this._keybindingsFilename, []).pipe(
                        catchError((e) => {
                            log.error("Error saving the initial keybinding settings.", e);
                            return null;
                        }),
                    ).subscribe();
                }
                this._keybindings.next(defaultKeybindings.concat(data));
            });
        });
    }

    private _parseUserSettings(value: string): Partial<Settings> {
        if (!value) {
            return {};
        }

        try {
            return JSON.parse(stripJsonComments(value));
        } catch (e) {
            return {};
        }
    }
}
