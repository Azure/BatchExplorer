import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { BatchFlaskSettings, EntityConfigurationView } from "./batch-flask-settings.model";

const defaultSettings: BatchFlaskSettings = {
    entityConfiguration: {
        defaultView: EntityConfigurationView.pretty,
    },
    autoUpdateOnQuit: true,
    fileAssociations: {},
};

@Injectable({providedIn: "root"})
export class BatchFlaskSettingsService {
    public settingsObs: Observable<BatchFlaskSettings>;

    public get settings() { return this._settings.value; }
    private _settings = new BehaviorSubject<BatchFlaskSettings>(defaultSettings);

    constructor() {
        this.settingsObs = this._settings.asObservable();
    }

    public updateSettings(settings: BatchFlaskSettings) {
        this._settings.next({ ...defaultSettings, ...settings });
    }
}
