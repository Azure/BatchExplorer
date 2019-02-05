import { Component, Input } from "@angular/core";

import { SubTaskDecorator } from "app/decorators";
import { SubtaskInformation } from "app/models";

@Component({
    selector: "bl-sub-task-properties",
    templateUrl: "sub-task-properties.html",
})
export class SubTaskPropertiesComponent {
    @Input()
    public set task(value: SubtaskInformation) {
        this.decorator = new SubTaskDecorator(value || {} as any);
        this._task = value;
    }

    public get task() { return this._task; }

    public decorator: SubTaskDecorator;
    private _task: SubtaskInformation;
}
