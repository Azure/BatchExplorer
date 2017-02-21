import { Injectable } from "@angular/core";
import * as storage from "electron-json-storage";
import { BehaviorSubject, Observable } from "rxjs";

import { KeyBindings, Settings, defaultKeybindings, defaultSettings } from "app/models";
import { log } from "app/utils";

@Injectable()
export class SettingsService {
    public settingsObs: Observable<Settings>;
    public keybindings: Observable<KeyBindings[]>;

    public hasSettingsLoaded: Observable<boolean>;
    public settings: Settings;

    private _hasSettingsLoaded = new BehaviorSubject<boolean>(false);
    private _settingsSubject = new BehaviorSubject<Settings>(null);
    private _keybindings = new BehaviorSubject<KeyBindings[]>(null);

    private _filename = "settings";
    private _keybindingsFilename = "keybindings";

    constructor() {
        this.settingsObs = this._settingsSubject.asObservable();
        this.keybindings = this._keybindings.asObservable();
        this.hasSettingsLoaded = this._hasSettingsLoaded.asObservable();
    }

    public init() {
        this.loadSettings();
    }

    private loadSettings() {
        storage.get(this._filename, (error, data) => {
            this.settings = Object.assign({}, defaultSettings, data);
            this._hasSettingsLoaded.next(true);
            this._settingsSubject.next(this.settings);
        });

        storage.get(this._keybindingsFilename, (error, data: KeyBindings[]) => {
            // If the file has never been init create it
            if (!Array.isArray(data)) {
                storage.set(this._keybindingsFilename, [], () => {
                    log.error("Error saving the initial keybinding settings.");
                });
            }
            this._keybindings.next(defaultKeybindings.concat(data));
        });
    }
}
