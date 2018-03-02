import { Component, Input, OnChanges } from "@angular/core";
import { EditorConfig } from "@bl-common/ui/editor";
import { Record } from "@bl-common/core";
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
    public editorConfig: EditorConfig = {
        language: "json",
        readOnly: true,
        tabSize: 2,
    } as any;

    constructor(settingsService: SettingsService) {
        const defaultView = settingsService.settings["configuration.default-view"];
        if (defaultView === EntityConfigurationView.json) {
            this.showJson = true;
        }
    }

    public ngOnChanges(changes) {
        if (changes.value) {
            this.jsonValue = JSON.stringify(this.value._original, null, 2);
        }
    }

    public toggleShowJson(value: boolean) {
        this.showJson = value;
    }
}
