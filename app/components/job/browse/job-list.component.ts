import { ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";

import { Filter, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { ContextMenu, ContextMenuItem } from "@batch-flask/ui/context-menu";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { Job, JobState } from "app/models";
import { FailureInfoDecorator } from "app/models/decorators";
import { JobListParams, JobService, PinnedEntityService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";
import { List } from "immutable";
import {
    DeleteJobAction,
    DeleteJobDialogComponent,
    DisableJobDialogComponent,
    EnableJobDialogComponent,
    TerminateJobDialogComponent,
} from "../action";

@Component({
    selector: "bl-job-list",
    templateUrl: "job-list.html",
    providers: [{
        provide: ListBaseComponent,
        useExisting: forwardRef(() => JobListComponent),
    }],
})
export class JobListComponent extends ListBaseComponent implements OnInit, OnDestroy {
    public jobs: List<Job> = List([]);
    public LoadingStatus = LoadingStatus;

    public data: ListView<Job, JobListParams>;
    public searchQuery = new FormControl();

    // todo: ask tim about setting difference select options for list and details.
    private _baseOptions = {};
    private _onJobAddedSub: Subscription;

    constructor(
        router: Router,
        private dialog: MatDialog,
        activatedRoute: ActivatedRoute,
        changeDetector: ChangeDetectorRef,
        private jobService: JobService,
        private pinnedEntityService: PinnedEntityService,
        private taskManager: BackgroundTaskService) {
        super(changeDetector);
        this.data = this.jobService.listView();
        ComponentUtils.setActiveItem(activatedRoute, this.data);
        this.data.items.subscribe((jobs) => {
            this.jobs = jobs;
            this.changeDetector.markForCheck();
        });

        this.data.status.subscribe((status) => {
            this.status = status;
        });

        this._onJobAddedSub = jobService.onJobAdded.subscribe((jobId) => {
            this.data.loadNewItem(jobService.get(jobId));
        });
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this.data.dispose();
        this._onJobAddedSub.unsubscribe();
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.data.refresh();
    }

    public handleFilter(filter: Filter) {
        if (filter.isEmpty()) {
            this.data.setOptions({ ...this._baseOptions });
        } else {
            this.data.setOptions({ ...this._baseOptions, filter });
        }

        this.data.fetchNext();
    }

    public jobStatus(job: Job): QuickListItemStatus {
        if (job.executionInfo && job.executionInfo.failureInfo) {
            return QuickListItemStatus.warning;
        } else {
            switch (job.state) {
                case JobState.completed:
                    return QuickListItemStatus.normal;
                case JobState.disabled:
                case JobState.disabling:
                    return QuickListItemStatus.accent;
                case JobState.active:
                case JobState.enabling:
                    return QuickListItemStatus.lightaccent;
                case JobState.terminating:
                    return QuickListItemStatus.important;
                default:
                    return QuickListItemStatus.normal;
            }
        }
    }

    public jobStatusText(job: Job): string {
        if (job.executionInfo && job.executionInfo.failureInfo) {
            return new FailureInfoDecorator(job.executionInfo.failureInfo).summary;
        } else {
            switch (job.state) {
                case JobState.completed:
                    return "";
                default:
                    return `Job is ${job.state}`;
            }
        }
    }

    public onScrollToBottom() {
        this.data.fetchNext();
    }

    public deleteSelection(selection: ListSelection) {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeleteJobAction(this.jobService, [...this.selection.keys]);
            task.start(backgroundTask);
            return task.waitingDone;
        });
    }

    public deleteJob(job: Job) {
        const dialogRef = this.dialog.open(DeleteJobDialogComponent);
        dialogRef.componentInstance.jobId = job.id;
        dialogRef.afterClosed().subscribe((obj) => {
            this.jobService.get(job.id);
        });
    }

    public terminateJob(job: Job) {
        const dialogRef = this.dialog.open(TerminateJobDialogComponent);
        dialogRef.componentInstance.jobId = job.id;
        dialogRef.afterClosed().subscribe((obj) => {
            this.jobService.get(job.id);
        });
    }

    public disableJob(job: Job) {
        const dialogRef = this.dialog.open(DisableJobDialogComponent);
        dialogRef.componentInstance.jobId = job.id;
        dialogRef.afterClosed().subscribe((obj) => {
            this.jobService.get(job.id);
        });
    }

    public enableJob(job: Job) {
        const dialogRef = this.dialog.open(EnableJobDialogComponent);
        dialogRef.componentInstance.jobId = job.id;
        dialogRef.afterClosed().subscribe((obj) => {
            this.jobService.get(job.id);
        });
    }

    public contextmenu(job: Job) {
        const isCompleted = job.state === JobState.completed;
        const isDisabled = job.state === JobState.disabled;
        return new ContextMenu([
            new ContextMenuItem({ label: "Delete", click: () => this.deleteJob(job) }),
            new ContextMenuItem({ label: "Terminate", click: () => this.terminateJob(job), enabled: !isCompleted }),
            new ContextMenuItem({
                label: "Enable",
                click: () => this.enableJob(job),
                enabled: !isCompleted && isDisabled,
            }),
            new ContextMenuItem({
                label: "Disable",
                click: () => this.disableJob(job),
                enabled: !isCompleted && !isDisabled,
            }),
            new ContextMenuItem({
                label: this.pinnedEntityService.isFavorite(job) ? "Unpin favorite" : "Pin to favorites",
                click: () => this._pinJob(job),
            }),
        ]);
    }

    public trackByFn(index: number, job: Job) {
        return job.id;
    }

    private _pinJob(job: Job) {
        this.pinnedEntityService.pinFavorite(job).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(job);
            }
        });
    }
}
