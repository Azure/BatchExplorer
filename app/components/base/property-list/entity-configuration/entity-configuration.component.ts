import { Component, Input, OnChanges } from "@angular/core";
import { Record } from "app/core";
import { EntityConfigurationView } from "app/models";
import { SettingsService } from "app/services";

import "./entity-configuration.scss";

@Component({
    selector: "bl-entity-configuration",
    templateUrl: "entity-configuration.html",
})
export class EntityConfigurationComponent implements OnChanges {
    @Input() public value: Record<any>;

    public showJson = false;
    public jsonValue = "{}";
    public editorConfig: CodeMirror.EditorConfiguration = {
        readOnly: true,
        lineNumbers: true,
        mode: "application/json",
        tabSize: 2,
        indentUnit: 2,
    };

    constructor(settingsService: SettingsService) {
        const defaultView = settingsService.settings["configuration.default-view"];
        if (defaultView === EntityConfigurationView.json) {
            this.showJson = true;
        }
    }

    public ngOnChanges(changes) {
        if (changes.value) {
            this.jsonValue = JSON.stringify(this.value.toJS(), null, 2);
        }
    }

    public toggleShowJson(value: boolean) {
        this.showJson = value;
    }
}
