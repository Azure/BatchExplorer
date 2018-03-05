import { Injectable } from "@angular/core";
import { BatchFlaskSettings, EntityConfigurationView } from "@batch-flask/ui/batch-flask-settings";

const defaultSettings: BatchFlaskSettings = {
    entityConfiguration: {
        defaultView: EntityConfigurationView.pretty,
    },
};

@Injectable()
export class BatchFlaskSettingsService {
    public get settings() { return this._settings; }
    private _settings: BatchFlaskSettings = defaultSettings;

    public updateSettings(settings: BatchFlaskSettings) {
        this._settings = { ...defaultSettings, ...settings };
    }
}
