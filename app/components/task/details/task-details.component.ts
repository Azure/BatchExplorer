import { Component, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { Job, Task } from "app/models";
import { TaskDecorator } from "app/models/decorators";
import { JobParams, JobService, TaskParams, TaskService } from "app/services";
import { RxEntityProxy } from "app/services/core";
import { SidebarManager } from "../../base/sidebar";
import { DeleteTaskDialogComponent, TaskCreateBasicDialogComponent, TerminateTaskDialogComponent } from "../action";

@Component({
    selector: "bl-task-details",
    templateUrl: "task-details.html",
})
export class TaskDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({id}, {tab}) {
        let label = tab ? `Task - ${tab}` : "Task";
        return {
            name: id,
            label,
        };
    }

    public taskId: string;
    public jobId: string;
    public data: RxEntityProxy<TaskParams, Task>;
    public jobData: RxEntityProxy<JobParams, Job>;

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
        private dialog: MdDialog,
        private route: ActivatedRoute,
        private viewContainerRef: ViewContainerRef,
        private sidebarManager: SidebarManager,
        private taskService: TaskService,
        private jobService: JobService,
        private router: Router) {

        this.data = taskService.get(null, null, {});
        this.jobData = jobService.get(null, {});
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
    }

    public get filterPlaceholderText() {
        return "Filter by file name";
    }

    @autobind()
    public refresh() {
        return this.data.refresh();
    }

    public addTask() {
        const createRef = this.sidebarManager.open("add-basic-task", TaskCreateBasicDialogComponent);
        createRef.component.jobId = this.jobId;
    }

    public terminateTask() {
        let config = new MdDialogConfig();
        config.viewContainerRef = this.viewContainerRef;

        const dialogRef = this.dialog.open(TerminateTaskDialogComponent, config);
        dialogRef.componentInstance.jobId = this.job.id;
        dialogRef.componentInstance.taskId = this.taskId;
        dialogRef.afterClosed().subscribe((obj) => {
            this.refresh();
        });
    }

    public deleteTask() {
        let config = new MdDialogConfig();
        config.viewContainerRef = this.viewContainerRef;

        const dialogRef = this.dialog.open(DeleteTaskDialogComponent, config);
        dialogRef.componentInstance.jobId = this.job.id;
        dialogRef.componentInstance.taskId = this.taskId;
        dialogRef.afterClosed().subscribe((obj: any) => {
            // if (obj && this.jobId === obj.jobId && this.taskId === obj.taskId) {
            //     this.router.navigate([`/jobs/${this.jobId}/tasks`]);
            // }
        });
    }

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
