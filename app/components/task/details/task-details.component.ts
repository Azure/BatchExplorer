import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "@batch-flask/core";
import { ElectronRemote } from "@batch-flask/ui";
import { Observable, Subscription } from "rxjs";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { Job, Task } from "app/models";
import { TaskDecorator } from "app/models/decorators";
import { FileSystemService, JobParams, JobService, TaskParams, TaskService } from "app/services";
import { EntityView } from "app/services/core";
import { DeleteTaskDialogComponent, TaskCreateBasicDialogComponent, TerminateTaskDialogComponent } from "../action";

@Component({
    selector: "bl-task-details",
    templateUrl: "task-details.html",
})
export class TaskDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        const label = tab ? `Task - ${tab}` : "Task";
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
        private fs: FileSystemService,
        taskService: TaskService,
        jobService: JobService,
        private remote: ElectronRemote,
        private changeDetector: ChangeDetectorRef,
        private router: Router) {

        this.data = taskService.view();
        this.jobData = jobService.view();
        this.data.item.subscribe((task) => {
            this.task = task;
            this.decorator = task && new TaskDecorator(task);
            changeDetector.markForCheck();
        });

        this.data.deleted.subscribe((key) => {
            if (this.taskId === key) {
                this.router.navigate(["/jobs", this.jobId, "tasks"]);
            }
        });

        this.jobData.item.subscribe(x => {
            this.job = x;
            changeDetector.markForCheck();
        });
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
        const config = new MatDialogConfig();
        const dialogRef = this.dialog.open(TerminateTaskDialogComponent, config);
        dialogRef.componentInstance.jobId = this.job.id;
        dialogRef.componentInstance.taskId = this.taskId;
        dialogRef.afterClosed().subscribe((obj) => {
            this.refresh();
        });
    }

    @autobind()
    public deleteTask() {
        const config = new MatDialogConfig();
        const dialogRef = this.dialog.open(DeleteTaskDialogComponent, config);
        dialogRef.componentInstance.jobId = this.job.id;
        dialogRef.componentInstance.taskId = this.taskId;
    }

    @autobind()
    public cloneTask() {
        const ref = this.sidebarManager.open(`add-task-${this.taskId}`, TaskCreateBasicDialogComponent);
        ref.component.jobId = this.jobId;
        ref.component.setValueFromEntity(this.task);
    }

    @autobind()
    public exportAsJSON() {
        const dialog = this.remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Export",
            defaultPath: `${this.jobId}.${this.taskId}.json`,
        });

        if (localPath) {
            const content = JSON.stringify(this.task._original, null, 2);
            return Observable.fromPromise(this.fs.saveFile(localPath, content));
        }
    }

    public update() {
        if (this.taskId && this.jobId) {
            this.data.params = { id: this.taskId, jobId: this.jobId };
            this.data.fetch();
            this._refreshJobData();
            this.changeDetector.markForCheck();
        }
    }

    private _refreshJobData() {
        this.jobData.params = { id: this.jobId };
        this.jobData.fetch();
    }
}
