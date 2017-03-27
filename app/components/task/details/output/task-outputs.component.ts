import { Component, Input } from "@angular/core";

@Component({
    selector: "bl-task-outputs",
    templateUrl: "task-outputs.html",
})
export class TaskOutputsComponent {
    @Input()
    public jobId: string;

    @Input()
    public taskId: string;

    public selectedTab: string = "node";

    public get filterPlaceholderText() {
        return "Filter by file name";
    }
}
