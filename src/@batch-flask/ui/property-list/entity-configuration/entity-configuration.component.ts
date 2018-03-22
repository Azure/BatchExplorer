import { Component, Input, OnChanges } from "@angular/core";
import { Record } from "@batch-flask/core";
import { BatchFlaskSettingsService, EntityConfigurationView } from "@batch-flask/ui/batch-flask-settings";
import { EditorConfig } from "@batch-flask/ui/editor";

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

    constructor(settingsService: BatchFlaskSettingsService) {
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
