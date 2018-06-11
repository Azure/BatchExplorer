import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";

import { Filter, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { Job, JobState } from "app/models";
import { FailureInfoDecorator } from "app/models/decorators";
import { JobListParams, JobService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";
import { List } from "immutable";
import {
    DeleteJobAction,
    JobCommands,
    PatchJobComponent,
} from "../action";

@Component({
    selector: "bl-job-list",
    templateUrl: "job-list.html",
    providers: [JobCommands, {
        provide: ListBaseComponent,
        useExisting: forwardRef(() => JobListComponent),
    }],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobListComponent extends ListBaseComponent implements OnInit, OnDestroy {
    public jobs: List<Job> = List([]);
    public LoadingStatus = LoadingStatus;

    public data: ListView<Job, JobListParams>;
    public searchQuery = new FormControl();

    // todo: ask tim about setting difference select options for list and details.
    private _baseOptions = { };
    private _onJobAddedSub: Subscription;
    constructor(
        router: Router,
        activatedRoute: ActivatedRoute,
        changeDetector: ChangeDetectorRef,
        public commands: JobCommands,
        private sidebarManager: SidebarManager,
        private jobService: JobService,
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
            this.changeDetector.markForCheck();
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

    public editJob(job: Job) {
        const ref = this.sidebarManager
            .open(`edit-job-${job.id}`, PatchJobComponent);
        ref.component.jobId = job.id;
        ref.component.checkJobStateForPoolPicker(job.state);
        ref.component.setValueFromEntity(job);
    }

    public deleteSelection(selection: ListSelection) {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeleteJobAction(this.jobService, [...this.selection.keys]);
            task.start(backgroundTask);
            return task.waitingDone;
        });
        // this.jobService.deleteJobs([...this.selection.keys])
    }

    public trackByFn(index: number, job: Job) {
        return job.id;
    }
}
