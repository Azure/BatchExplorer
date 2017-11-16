import { Component, OnDestroy } from "@angular/core";
import { FormControl } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable, Subscription } from "rxjs";

import { SettingsService } from "app/services";
import { validJsonConfig } from "app/utils/validators";
import "./settings.scss";

// tslint:disable-next-line:no-var-requires
const defaultSettings = require("./default-settings.json");

const emptyConfig = "// Place your settings in this file to overwrite the default settings\n{\n\n}";

@Component({
    selector: "bl-settings",
    templateUrl: "settings.html",
})
export class SettingsComponent implements OnDestroy {
    public static breadcrumb(params, queryParams) {
        return { name: "Settings" };
    }

    public defaultSettingsEditorConfig: CodeMirror.EditorConfiguration = {
        readOnly: true,
        lineNumbers: true,
        mode: "application/javascript",
        tabSize: 2,
        indentUnit: 2,
    };

    public userSettingsEditorConfig: CodeMirror.EditorConfiguration = {
        lineNumbers: true,
        mode: "application/javascript",
        tabSize: 2,
        indentUnit: 2,
        gutters: ["CodeMirror-lint-markers"],
        lint: true,
        extraKeys: {
            "Ctrl-S": this.save,
        },
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
}
