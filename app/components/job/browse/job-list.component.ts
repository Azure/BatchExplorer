import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Filter, ListView, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { Job, JobState } from "app/models";
import { FailureInfoDecorator } from "app/models/decorators";
import { JobListParams, JobService } from "app/services";
import { ComponentUtils } from "app/utils";
import { List } from "immutable";
import { Observable, Subscription, of } from "rxjs";
import { flatMap, map } from "rxjs/operators";
import { WaitForDeletePoller } from "../../core/pollers";
import {
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
        private activityService: ActivityService) {
        super(changeDetector);
        this.data = this.jobService.listView(this._baseOptions);
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
        const selectionArr = Array.from(selection.keys);

        const initializer = () => {
            return of(selectionArr).pipe(
                map(jobIDs => {
                    // map each selected job id to a job deletion activity
                    return jobIDs.map(id => {
                        const name = `Deleting Job '${id}'`;
                        const activity = new Activity(name, () => {
                            return this.jobService.delete(id).pipe(
                                flatMap(obs => {
                                    const poller = new WaitForDeletePoller(() => this.jobService.get(id));
                                    return poller.start();
                                }),
                            );
                        });
                        activity.done.subscribe(() => this.refresh());
                        return activity;
                    });
                }),
            );
        };

        let mainName = `Deleting ${selectionArr.length} Job`;
        if (selectionArr.length > 1) {
            mainName += "s";
        }
        const deleteActivity = new Activity(mainName, initializer);
        this.activityService.loadAndRun(deleteActivity);
        deleteActivity.done.subscribe(() => this.refresh());
        return deleteActivity.done;
    }

    public trackByFn(index: number, job: Job) {
        return job.id;
    }
}
