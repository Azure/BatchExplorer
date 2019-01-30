import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit } from "@angular/core";
import { BatchFlaskUserConfiguration, Record, UserConfigurationService } from "@batch-flask/core";
import { EntityConfigurationView } from "@batch-flask/ui/batch-flask-settings";
import { EditorConfig } from "@batch-flask/ui/editor";

import "./entity-configuration.scss";

@Component({
    selector: "bl-entity-configuration",
    templateUrl: "entity-configuration.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityConfigurationComponent implements OnInit, OnChanges {
    @Input() public value: Record<any>;
    @Input() public enableJsonView = true;

    public showJson = false;
    public jsonValue = "{}";
    public editorConfig: EditorConfig = {
        language: "json",
        readOnly: true,
        tabSize: 2,
    } as any;

    constructor(
        private settingsService: UserConfigurationService<BatchFlaskUserConfiguration>,
        private changeDetector: ChangeDetectorRef) {

    }

    public ngOnInit() {
        const settings = this.settingsService.current;
        const defaultView = settings && settings.entityConfiguration && settings.entityConfiguration.defaultView;
        if (this.enableJsonView && defaultView === EntityConfigurationView.JSON) {
            this.showJson = true;
        }
    }
    public ngOnChanges(changes) {
        if (changes.value) {
            this.jsonValue = JSON.stringify(this.value._original, null, 2);
        }

        if (changes.enableJsonView) {
            if (!this.enableJsonView) {
                this.showJson = false; // Make sure we don't show the json form if it got disabled
            }
        }
    }

    public toggleShowJson(value: boolean) {
        if (!this.enableJsonView) { return; }
        this.showJson = value;
        this.changeDetector.markForCheck();
    }
}
