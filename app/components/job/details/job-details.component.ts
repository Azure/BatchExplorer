import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "@batch-flask/core";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { JobScheduleCreateBasicDialogComponent } from "app/components/job-schedule/action";
import { Job, JobSchedule, JobState } from "app/models";
import { JobDecorator } from "app/models/decorators";
import { FileSystemService, JobParams, JobService } from "app/services";
import { EntityView } from "app/services/core";
import { TaskCreateBasicDialogComponent } from "../../task/action";
import {
    DeleteJobDialogComponent,
    EnableJobDialogComponent,
    JobCommands,
    JobCreateBasicDialogComponent,
    PatchJobComponent,
    TerminateJobDialogComponent,
} from "../action";

import { DialogService, ElectronRemote, InjectorFactory } from "@batch-flask/ui";
import "./job-details.scss";

@Component({
    selector: "bl-job-details",
    templateUrl: "job-details.html",
})
export class JobDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        const label = tab ? `Job - ${tab}` : "Job";
        return {
            name: id,
            label,
            icon: "tasks",
        };
    }

    public jobId: string;
    public job: Job;
    public decorator: JobDecorator;
    public data: EntityView<Job, JobParams>;
    public JobState = JobState;
    public hasHookTask = false;
    public jobCommands: JobCommands;

    private _paramsSubscriber: Subscription;

    constructor(
        private injectorFactory: InjectorFactory,
        private dialog: DialogService,
        private activatedRoute: ActivatedRoute,
        private fs: FileSystemService,
        private remote: ElectronRemote,
        private sidebarManager: SidebarManager,
        private jobService: JobService,
        private router: Router) {
        this.jobCommands = this.injectorFactory.create(JobCommands);

        this.data = this.jobService.view();
        this.data.item.subscribe((job) => {
            this.job = job;
            this.hasHookTask = Boolean(job && job.jobPreparationTask);
            if (job) {
                this.decorator = new JobDecorator(job);
            }
        });

        this.data.deleted.subscribe((key) => {
            if (this.jobId === key) {
                this.router.navigate(["/jobs"]);
            }
        });
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.jobId = params["id"];
            this.data.params = { id: this.jobId };
            this.data.fetch();
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
        this.data.dispose();
    }

    public get filterPlaceholderText() {
        return "Filter by task id";
    }

    @autobind()
    public refresh() {
        return this.data.refresh();
    }

    @autobind()
    public editJob() {
        const ref = this.sidebarManager
            .open(`edit-job-schedule-${this.jobId}`, PatchJobComponent);
        ref.component.jobId = this.jobId;
        ref.component.checkJobStateForPoolPicker(this.job.state);
        ref.component.setValueFromEntity(this.job);
    }

    @autobind()
    public addTask() {
        const createRef = this.sidebarManager.open("add-task", TaskCreateBasicDialogComponent);
        createRef.component.jobId = this.job.id;
    }

    @autobind()
    public terminateJob() {
        this.jobCommands.terminate.execute(this.job);
    }

    @autobind()
    public deleteJob() {
        this.jobCommands.delete.execute(this.job);
    }

    @autobind()
    public disableJob() {
        this.jobCommands.disable.execute(this.job);
    }

    @autobind()
    public cloneJob() {
        const ref = this.sidebarManager.open(`add-job-${this.jobId}`, JobCreateBasicDialogComponent);
        ref.component.setValueFromEntity(this.job);
    }

    @autobind()
    public createJobSchedule() {
        const ref = this.sidebarManager.open(`add-job-schedule`,
            JobScheduleCreateBasicDialogComponent);
        ref.component.setValueFromEntity(new JobSchedule({
            jobSpecification: this.job.toJS(),
        }));
    }

    @autobind()
    public enableJob() {
        this.jobCommands.enable.execute(this.job);
    }

    @autobind()
    public updateTags(tags: List<string>) {
        return this.jobService.updateTags(this.job, tags).flatMap(() => {
            return this.data.refresh();
        });
    }

    @autobind()
    public exportAsJSON() {
        const dialog = this.remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Export",
            defaultPath: `${this.jobId}.json`,
        });

        if (localPath) {
            const content = JSON.stringify(this.job._original, null, 2);
            return Observable.fromPromise(this.fs.saveFile(localPath, content));
        }
    }
}
