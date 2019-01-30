import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable, from } from "rxjs";
// tslint:disable-next-line:no-var-requires
const stripJsonComments = require("strip-json-comments");

import { GlobalStorage } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { KeyBindings, Settings } from "app/models";
import { catchError, filter } from "rxjs/operators";

// tslint:disable-next-line:no-var-requires
const defaultSettings = JSON.parse(stripJsonComments(require("app/components/settings/default-settings.json")));

@Injectable({ providedIn: "root" })
export class SettingsService implements OnDestroy {
    public settingsObs: Observable<Settings>;
    public keybindings: Observable<KeyBindings[]>;

    public hasSettingsLoaded: Observable<boolean>;
    public settings: Settings;
    public userSettingsStr: string;

    private _hasSettingsLoaded = new BehaviorSubject<boolean>(false);
    private _settingsSubject = new BehaviorSubject<Settings>(null);
    private _keybindings = new BehaviorSubject<KeyBindings[]>(null);

    private _filename = "../settings";

    constructor(
        private storage: GlobalStorage) {
        this.settingsObs = this._settingsSubject.pipe(filter(x => Boolean(x)));
        this.keybindings = this._keybindings.pipe(filter(x => Boolean(x)));
        this.hasSettingsLoaded = this._hasSettingsLoaded.asObservable();
    }

    public ngOnDestroy() {
        // Nothing
    }

    public init() {
        this.loadSettings();
    }

    public saveUserSettings(userSettings: string): Observable<any> {
        this.userSettingsStr = userSettings;
        this.settings = { ...defaultSettings, ...this._parseUserSettings(userSettings) };
        this._settingsSubject.next(this.settings);
        return from(this.storage.save(this._filename, userSettings));
    }

    private loadSettings() {
        from(this.storage.getContent(this._filename)).pipe(
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
