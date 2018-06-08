import { Component, OnDestroy } from "@angular/core";
import { FormControl } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { Observable, Subscription } from "rxjs";

// tslint:disable-next-line:no-var-requires
const stripJsonComments = require("strip-json-comments");
import { EditorConfig, KeyCode, KeyMod } from "@batch-flask/ui/editor";
import { validJsonConfig } from "@batch-flask/utils/validators";
import { SettingsService } from "app/services";
import "./settings.scss";

// tslint:disable-next-line:no-var-requires
// TODO-TIM check dis
// const defaultSettings = require("raw-loader!./default-settings.json");
const defaultSettings = "{}";

const emptyConfig = "// Place your settings in this file to overwrite the default settings\n{\n\n}";

@Component({
    selector: "bl-settings",
    templateUrl: "settings.html",
})
export class SettingsComponent implements OnDestroy {
    public static breadcrumb(params, queryParams) {
        return { name: "Settings" };
    }

    public defaultSettingsEditorConfig: EditorConfig = {
        readOnly: true,
        language: "json",
        minimap: {
            enabled: false,
        },
        tabSize: 2,
    };

    public userSettingsEditorConfig: EditorConfig = {
        language: "json",
        tabSize: 2,
        keybindings: [
            { key: KeyMod.CtrlCmd | KeyCode.KEY_S, action: this.save },
        ],
    };

    public defaultSettings = defaultSettings;
    public userSettings = new FormControl(emptyConfig, null, validJsonConfig);

    private _originalUserSettings: string;
    private _subs: Subscription[] = [];

    constructor(private settingsService: SettingsService) {
        this._subs.push(this.settingsService.settingsObs.subscribe((e) => {
            this._updateOriginalValue();
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    @autobind()
    public save(): Observable<any> {
        if (!this._isValid()) {
            return;
        }
        return this.settingsService.saveUserSettings(this.userSettings.value);
    }

    public reset() {
        this.userSettings.setValue(this._originalUserSettings);
    }

    public get modified() {
        return this._originalUserSettings !== this.userSettings.value;
    }

    private _updateOriginalValue() {
        const str = this.settingsService.userSettingsStr || emptyConfig;
        this._originalUserSettings = str;

        if (this.userSettings.untouched) {
            this.userSettings.setValue(str);
        }
    }

    private _isValid() {
        try {
            JSON.parse(stripJsonComments(this.userSettings.value, { whitespace: true }));
            return true;
        } catch (e) {
            return false;
        }
    }
}
