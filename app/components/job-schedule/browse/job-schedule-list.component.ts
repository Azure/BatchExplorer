import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Filter, ListView, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { JobSchedule, JobScheduleState } from "app/models";
import { JobScheduleListParams, JobScheduleService } from "app/services";
import { ComponentUtils } from "app/utils";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";
import { DeleteJobScheduleAction, JobScheduleCommands } from "../action";

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
        private taskManager: BackgroundTaskService) {
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
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeleteJobScheduleAction(this.jobScheduleService, [...selection.keys]);
            task.start(backgroundTask);
            return task.waitingDone;
        });
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
