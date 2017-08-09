import { Component, OnDestroy } from "@angular/core";
import { FormControl } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable, Subscription } from "rxjs";

import { SettingsService } from "app/services";
import "./settings.scss";

// tslint:disable-next-line:no-var-requires
const defaultSettings = require("./default-settings.json");

const emptyConfig = "{\n\n}";

@Component({
    selector: "bl-settings",
    templateUrl: "settings.html",
})
export class SettingsComponent implements OnDestroy {

    public defaultSettingsEditorConfig: CodeMirror.EditorConfiguration = {
        readOnly: true,
        lineNumbers: true,
        mode: "application/json",
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
    public userSettings = new FormControl(emptyConfig, null, this._validJsonConfig);

    private _originalUserSettings: string;
    private _subs: Subscription[] = [];
    private _validateDebounceTimeout;

    constructor(private settingsService: SettingsService) {
        this._subs.push(this.settingsService.settingsObs.subscribe(() => {
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

    private _updateOriginalValue() {
        const str = this.settingsService.userSettingsStr || emptyConfig;
        this._originalUserSettings = str;

        if (this.userSettings.untouched) {
            this.userSettings.setValue(str);
        }
    }

    @autobind()
    private _validJsonConfig(c: FormControl): Promise<any> {
        clearTimeout(this._validateDebounceTimeout);
        return new Promise((resolve, reject) => {
            this._validateDebounceTimeout = setTimeout(() => {
                try {
                    JSON.parse(JSON.minify(c.value));
                    resolve(null);
                } catch (e) {
                    resolve({
                        validJsonConfig: {
                            valid: false,
                            message: e.message,
                        },
                    });
                }
            }, 400);
        });
    }
}
