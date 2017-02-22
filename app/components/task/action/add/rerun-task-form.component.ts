import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Observable } from "rxjs";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { TaskService } from "app/services";
import { ObservableUtils } from "app/utils";
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
        notificationService: NotificationService) {
        super(formBuilder, sidebarRef, taskService, notificationService);

        this.title = "Rerun task";
        this.subtitle = "This will delete the task and create a new one with the same id.";
        this.multiUse = false;
        this.actionName = "Rerun";
        this.disable("id");
    }

    public execute() {
        const id = this.form.getRawValue().id;

        return ObservableUtils.queue(
            () => this.taskService.delete(this.jobId, id).catch(() => Observable.of({})),
            () => super.execute(),
        );
    }
}
