import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EntityView, autobind } from "@batch-flask/core";
import { Subscription } from "rxjs";

import { TaskDecorator } from "app/decorators";
import { Job, Task } from "app/models";
import { JobParams, JobService, TaskParams, TaskService } from "app/services";
import { TaskCommands } from "../action";

@Component({
    selector: "bl-task-details",
    templateUrl: "task-details.html",
    providers: [TaskCommands],
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
        public commands: TaskCommands,
        private route: ActivatedRoute,
        private taskService: TaskService,
        private jobService: JobService,
        private changeDetector: ChangeDetectorRef,
        private router: Router) {

        this.data = this.taskService.view();
        this.jobData = this.jobService.view();
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
            this.commands.params = { jobId: this.jobId };
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
