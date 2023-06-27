import {
    ChangeDetectionStrategy,  Component, Injector, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Filter, ListView, autobind } from "@batch-flask/core";
import { ListSelection } from "@batch-flask/core/list";
import { ListBaseComponent } from "@batch-flask/ui";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { JobSchedule, JobScheduleState } from "app/models";
import { JobScheduleListParams, JobScheduleService } from "app/services";
import { ComponentUtils } from "app/utils";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
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
        activatedRoute: ActivatedRoute,
        injector: Injector,
        public commands: JobScheduleCommands,
        private jobScheduleService: JobScheduleService) {
        super(injector);

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
        super.ngOnDestroy();
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

        return this.data.fetchNext().pipe(map(x => x.items.size));
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
        this.commands.delete.executeFromSelection(selection).subscribe();
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
}
