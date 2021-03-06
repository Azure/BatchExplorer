import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { NameValuePair, SubtaskInformation, Task } from "app/models";
import { List } from "immutable";

@Component({
    selector: "bl-sub-task-properties",
    templateUrl: "sub-task-properties.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubTaskPropertiesComponent {
    @Input() public parentTask: Task;
    @Input() public task: SubtaskInformation;

    public formatErrorDetails(details: List<NameValuePair>): string {
        const names = Object.keys(details);
        if (names.length > 0) {
            const resultList = details.map(detail => detail.name + ": " + detail.value);
            return resultList.join("; ");
        } else {
            return `Additional error details could not be found`;
        }
    }
}
