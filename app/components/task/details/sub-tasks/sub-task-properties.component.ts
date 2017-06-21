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
        this.failureInfo = this.decorator.failureInfo || {};
        this.nodeInfo = this.decorator.nodeInfo || {};
    }

    public decorator: SubTaskDecorator;
    public failureInfo: any;
    public nodeInfo: any;
}
