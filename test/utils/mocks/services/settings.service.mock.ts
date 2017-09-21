import { Observable } from "rxjs";
// tslint:disable-next-line:no-var-requires
const stripJsonComments = require("strip-json-comments");

import { SettingsService } from "app/services";

// tslint:disable-next-line:no-var-requires
const defaultSettings = JSON.parse(stripJsonComments(require("app/components/settings/default-settings.json")));

export class MockSettingsService {
    public static asProvider() {
        return { provide: SettingsService, useValue: new MockSettingsService() };
    }

    public settings = defaultSettings;

    public settingsObs = Observable.of(defaultSettings);
}
