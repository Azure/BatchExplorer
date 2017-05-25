import { Component, Input } from "@angular/core";

import { SubtaskInformation } from "app/models";
import { SubTaskDecorator } from "app/models/decorators";

@Component({
    selector: "bl-sub-task-properties",
    templateUrl: "sub-task-properties.html",
})

export class SubTaskPropertiesComponent {
    @Input()
    public set task(value: SubtaskInformation) {
        this.decorator = new SubTaskDecorator(value || {} as any);
        this.schedulingError = this.decorator.schedulingError || {};
        this.nodeInfo = this.decorator.nodeInfo || {};
    }

    public decorator: SubTaskDecorator;
    public schedulingError: any;
    public nodeInfo: any;
}
