import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";

import { BackgroundTaskService } from "app/components/base/background-task";
import { ContextMenu, ContextMenuItem } from "app/components/base/context-menu";
import { LoadingStatus } from "app/components/base/loading";
import { QuickListComponent, QuickListItemStatus } from "app/components/base/quick-list";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { TableComponent } from "app/components/base/table";
import { autobind } from "app/core";
import { JobSchedule, JobScheduleState } from "app/models";
import { JobScheduleListParams, JobScheduleService, PinnedEntityService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bl-job-schedule-list",
    templateUrl: "job-schedule-list.html",
})
export class JobScheduleListComponent extends ListOrTableBase implements OnInit, OnDestroy {
    public LoadingStatus = LoadingStatus;

    public status: Observable<LoadingStatus>;
    public data: ListView<JobSchedule, JobScheduleListParams>;
    public searchQuery = new FormControl();

    @ViewChild(QuickListComponent)
    public list: QuickListComponent;

    @ViewChild(TableComponent)
    public table: TableComponent;

    @Input()
    public quickList: boolean;

    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;

        if (filter.isEmpty()) {
            this.data.setOptions({ ...this._baseOptions });
        } else {
            this.data.setOptions({ ...this._baseOptions, filter: filter.toOData() });
        }

        this.data.fetchNext();
    }
    public get filter(): Filter { return this._filter; }

    private _filter: Filter;

    // todo: ask tim about setting difference select options for list and details.
    private _baseOptions = {  };
    private _onJobScheduleAddedSub: Subscription;

    constructor(
        router: Router,
        dialog: MatDialog,
        activatedRoute: ActivatedRoute,
        private jobScheduleService: JobScheduleService,
        private pinnedEntityService: PinnedEntityService,
        private taskManager: BackgroundTaskService,
    ) {
        super(dialog);
        this.data = this.jobScheduleService.listView();
        ComponentUtils.setActiveItem(activatedRoute, this.data);

        this.status = this.data.status;
        this._onJobScheduleAddedSub = jobScheduleService.onJobScheduleAdded.subscribe((jobScheduleId) => {
            this.data.loadNewItem(jobScheduleService.get(jobScheduleId));
        });
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        if (this._onJobScheduleAddedSub) {
            this._onJobScheduleAddedSub.unsubscribe();
        }
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.data.refresh();
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

    public jobScheduleStatusText(jobSchedule: JobSchedule): string {
        switch (jobSchedule.state) {
            case JobScheduleState.completed:
                return "";
            default:
                return `Job schedule is ${jobSchedule.state}`;
        }
    }

    public onScrollToBottom(x) {
        this.data.fetchNext();
    }

    public contextmenu(jobSchedule: JobSchedule) {
        return new ContextMenu([
            new ContextMenuItem({
                label: this.pinnedEntityService.isFavorite(jobSchedule) ? "Unpin favorite" : "Pin to favorites",
                click: () => this._pinJobSchedule(jobSchedule),
            }),
        ]);
    }

    public trackByFn(index: number, jobSchedule: JobSchedule) {
        return jobSchedule.id;
    }

    private _pinJobSchedule(jobSchedule: JobSchedule) {
        this.pinnedEntityService.pinFavorite(jobSchedule).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(jobSchedule);
            }
        });
    }
}
