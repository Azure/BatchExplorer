import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { TaskCreateDto } from "app/models/dtos";
import { JobService, PoolService, TaskService } from "app/services";
import { ObservableUtils } from "app/utils";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { TaskCreateBasicDialogComponent } from "./task-create-basic-dialog.component";

@Component({
    selector: "bl-rerun-task-form",
    templateUrl: "task-create-basic-dialog.html",
})
export class RerunTaskFormComponent extends TaskCreateBasicDialogComponent {
    constructor(
        formBuilder: FormBuilder,
        sidebarRef: SidebarRef<TaskCreateBasicDialogComponent>,
        taskService: TaskService,
        jobService: JobService,
        poolService: PoolService,
        notificationService: NotificationService) {
        super(formBuilder, sidebarRef, taskService, notificationService, jobService, poolService);

        this.title = "Rerun task";
        this.subtitle = "This will delete the task and create a new one with the same id.";
        this.multiUse = false;
        this.actionName = "Rerun";
        this.disable("id");
    }

    @autobind()
    public submit(data: TaskCreateDto): Observable<any> {
        const id = this.form.getRawValue().id;
        data.id = id;
        return ObservableUtils.queue(
            () => this.taskService.delete(this.jobId, id).pipe(catchError(() => of({}))),
            () => super.submit(data),
        );
    }
}
