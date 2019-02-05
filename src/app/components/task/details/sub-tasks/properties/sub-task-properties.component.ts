import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { SubtaskInformation, Task } from "app/models";

@Component({
    selector: "bl-sub-task-properties",
    templateUrl: "sub-task-properties.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubTaskPropertiesComponent {
    @Input() public parentTask: Task;
    @Input() public task: SubtaskInformation;
}
