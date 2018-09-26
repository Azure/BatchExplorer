import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { I18nService, autobind } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { TaskCreateDto } from "app/models/dtos";
import { JobService, PoolService, TaskService } from "app/services";
import { ObservableUtils } from "app/utils";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { AddTaskFormComponent } from "./add-task-form.component";

@Component({
    selector: "bl-rerun-task-form",
    templateUrl: "add-task-form.html",
})
export class RerunTaskFormComponent extends AddTaskFormComponent {
    constructor(
        i18n: I18nService,
        formBuilder: FormBuilder,
        sidebarRef: SidebarRef<RerunTaskFormComponent>,
        taskService: TaskService,
        jobService: JobService,
        poolService: PoolService,
        notificationService: NotificationService) {
        super(i18n, formBuilder, sidebarRef, taskService, notificationService, jobService, poolService);

        this.title = i18n.t("rerun-task-form.title");
        this.subtitle = i18n.t("rerun-task-form.subtitle");
        this.multiUse = false;
        this.actionName = i18n.t("rerun-task-form.action");

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
