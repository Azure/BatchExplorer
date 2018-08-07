import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Filter, ListView, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { JobSchedule, JobScheduleState } from "app/models";
import { JobScheduleListParams, JobScheduleService } from "app/services";
import { ComponentUtils } from "app/utils";
import { List } from "immutable";
import { Observable, Subscription, of } from "rxjs";
import { flatMap, map } from "rxjs/operators";
import { WaitForDeletePoller } from "../../core/pollers";
import { JobScheduleCommands } from "../action";

@Component({
    selector: "bl-job-schedule-list",
    templateUrl: "job-schedule-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [JobScheduleCommands, {
        provide: ListBaseComponent,
        useExisting: forwardRef(() => JobScheduleListComponent),
    }],
})
export class JobScheduleListComponent extends ListBaseComponent implements OnInit, OnDestroy {
    public jobSchedules: List<JobSchedule>;
    public LoadingStatus = LoadingStatus;

    public data: ListView<JobSchedule, JobScheduleListParams>;
    public searchQuery = new FormControl();

    private _baseOptions = {};
    private _onJobScheduleAddedSub: Subscription;

    constructor(
        router: Router,
        activatedRoute: ActivatedRoute,
        changeDetector: ChangeDetectorRef,
        public commands: JobScheduleCommands,
        private jobScheduleService: JobScheduleService,
        private activityService: ActivityService) {
        super(changeDetector);

        this.data = this.jobScheduleService.listView();
        ComponentUtils.setActiveItem(activatedRoute, this.data);
        this.data.items.subscribe((jobSchedules) => {
            this.jobSchedules = jobSchedules;
            this.changeDetector.markForCheck();
        });

        this.data.status.subscribe((status) => {
            this.status = status;
        });

        this._onJobScheduleAddedSub = jobScheduleService.onJobScheduleAdded.subscribe((jobScheduleId) => {
            this.data.loadNewItem(jobScheduleService.get(jobScheduleId));
        });
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this.data.dispose();
        if (this._onJobScheduleAddedSub) {
            this._onJobScheduleAddedSub.unsubscribe();
        }
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.data.refresh();
    }

    public handleFilter(filter: Filter) {
        if (filter.isEmpty()) {
            this.data.setOptions({ ...this._baseOptions });
        } else {
            this.data.setOptions({ ...this._baseOptions, filter: filter });
        }

        this.data.fetchNext();
    }

    public jobScheduleStatus(jobSchedule: JobSchedule): QuickListItemStatus {
        switch (jobSchedule.state) {
            case JobScheduleState.completed:
                return QuickListItemStatus.normal;
            case JobScheduleState.disabled:
                return QuickListItemStatus.accent;
            case JobScheduleState.active:
                return QuickListItemStatus.lightaccent;
            case JobScheduleState.terminating:
                return QuickListItemStatus.important;
            default:
                return QuickListItemStatus.normal;
        }
    }

    public deleteSelection(selection: ListSelection) {
        const selectionArr = Array.from(selection.keys);

        const initializer = () => {
            return of(selectionArr).pipe(
                map(jobScheduleIDs => {
                    // map each selected job id to a job deletion activity
                    return jobScheduleIDs.map(id => {
                        const name = `Deleting Job Schedule '${id}'`;
                        const activity = new Activity(name, () => {
                            return this.jobScheduleService.delete(id).pipe(
                                flatMap(obs => {
                                    const poller = new WaitForDeletePoller(() => {
                                        return this.jobScheduleService.get(id);
                                    });
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

        let mainName = `Deleting ${selectionArr.length} Job Schedule`;
        if (selectionArr.length > 1) {
            mainName += "s";
        }
        const deleteActivity = new Activity(mainName, initializer);
        this.activityService.loadAndRun(deleteActivity);
        deleteActivity.done.subscribe(() => this.refresh());
        return deleteActivity.done;
    }

    public jobScheduleStatusText(jobSchedule: JobSchedule): string {
        switch (jobSchedule.state) {
            case JobScheduleState.completed:
                return "";
            default:
                return `Job schedule is ${jobSchedule.state}`;
        }
    }

    public onScrollToBottom() {
        this.data.fetchNext();
    }

    public trackByFn(index: number, jobSchedule: JobSchedule) {
        return jobSchedule.id;
    }
}
