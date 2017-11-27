import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { Job, Task } from "app/models";
import { TaskDecorator } from "app/models/decorators";
import { JobParams, JobService, TaskParams, TaskService } from "app/services";
import { EntityView } from "app/services/core";
import { SidebarManager } from "../../base/sidebar";
import { DeleteTaskDialogComponent, TaskCreateBasicDialogComponent, TerminateTaskDialogComponent } from "../action";

@Component({
    selector: "bl-task-details",
    templateUrl: "task-details.html",
})
export class TaskDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        let label = tab ? `Task - ${tab}` : "Task";
        return {
            name: id,
            label,
            icon: "cogs",
        };
    }

    public taskId: string;
    public jobId: string;
    public data: EntityView<Task, TaskParams>;
    public jobData: EntityView<Job, JobParams>;

    public task: Task;
    public decorator: TaskDecorator;
    public job: Job;

    public get hasMultiInstanceSettings() {
        return this.task && Boolean(this.task.multiInstanceSettings);
    }

    public get hasDependencies() {
        return this.task && Boolean(this.task.dependsOn);
    }

    private _paramsSubscribers: Subscription[] = [];

    constructor(
        private dialog: MatDialog,
        private route: ActivatedRoute,
        private sidebarManager: SidebarManager,
        taskService: TaskService,
        jobService: JobService,
        private router: Router) {

        this.data = taskService.view();
        this.jobData = jobService.view();
        this.data.item.subscribe((task) => {
            this.task = task;
            this.decorator = task && new TaskDecorator(task);
        });

        this.data.deleted.subscribe((key) => {
            if (this.taskId === key) {
                this.router.navigate(["/jobs", this.jobId, "tasks"]);
            }
        });

        this.jobData.item.subscribe(x => this.job = x);
    }

    public ngOnInit() {
        this._paramsSubscribers.push(this.route.params.subscribe((params) => {
            this.taskId = params["id"];
            this.update();
        }));

        this._paramsSubscribers.push(this.route.parent.params.subscribe((params) => {
            this.jobId = params["jobId"];
            this.update();
        }));
    }

    public ngOnDestroy() {
        this._paramsSubscribers.forEach(x => x.unsubscribe());
        this.jobData.dispose();
        this.data.dispose();
    }

    @autobind()
    public refresh() {
        return this.data.refresh();
    }

    @autobind()
    public terminateTask() {
        let config = new MatDialogConfig();
        const dialogRef = this.dialog.open(TerminateTaskDialogComponent, config);
        dialogRef.componentInstance.jobId = this.job.id;
        dialogRef.componentInstance.taskId = this.taskId;
        dialogRef.afterClosed().subscribe((obj) => {
            this.refresh();
        });
    }

    @autobind()
    public deleteTask() {
        let config = new MatDialogConfig();
        const dialogRef = this.dialog.open(DeleteTaskDialogComponent, config);
        dialogRef.componentInstance.jobId = this.job.id;
        dialogRef.componentInstance.taskId = this.taskId;
    }

    @autobind()
    public cloneTask() {
        const ref = this.sidebarManager.open("add-basic-pool", TaskCreateBasicDialogComponent);
        ref.component.jobId = this.jobId;
        ref.component.setValueFromEntity(this.task);
    }

    public update() {
        if (this.taskId && this.jobId) {
            this.data.params = { id: this.taskId, jobId: this.jobId };
            this.data.fetch();
            this._refreshJobData();
        }
    }

    private _refreshJobData() {
        this.jobData.params = { id: this.jobId };
        this.jobData.fetch();
    }
}
