import { Component, Input } from "@angular/core";
import { JobHookTask } from "app/models";

import "./job-hook-task-details.scss";

@Component({
    selector: "bl-job-hook-task-details",
    templateUrl: "job-hook-task-details.html",
})
export class JobHookTaskDetailsComponent {
    @Input()
    public task: JobHookTask;
}
