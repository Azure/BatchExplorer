import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { BackgroundTaskService } from "@bl-common/ui/background-task";
import { ContextMenu, ContextMenuItem } from "@bl-common/ui/context-menu";
import { LoadingStatus } from "@bl-common/ui/loading";
import { QuickListItemStatus } from "@bl-common/ui/quick-list";
import { autobind } from "@bl-common/core";
import { ListBaseComponent, ListSelection } from "@bl-common/core/list";
import { JobSchedule, JobScheduleState } from "app/models";
import { JobScheduleListParams, JobScheduleService, PinnedEntityService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";
import { Filter } from "common";
import {
    DeleteJobScheduleAction,
    DeleteJobScheduleDialogComponent,
    DisableJobScheduleDialogComponent,
    EnableJobScheduleDialogComponent,
    TerminateJobScheduleDialogComponent,
} from "../action";

@Component({
    selector: "bl-job-schedule-list",
    templateUrl: "job-schedule-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
        provide: ListBaseComponent,
        useExisting: forwardRef(() => JobScheduleListComponent),
    }],
})
export class JobScheduleListComponent extends ListBaseComponent implements OnInit, OnDestroy {
    public jobSchedules: List<JobSchedule>;
    public LoadingStatus = LoadingStatus;

    public status: Observable<LoadingStatus>;
    public data: ListView<JobSchedule, JobScheduleListParams>;
    public searchQuery = new FormControl();

    private _baseOptions = {};
    private _onJobScheduleAddedSub: Subscription;

    constructor(
        router: Router,
        activatedRoute: ActivatedRoute,
        changeDetector: ChangeDetectorRef,
        private dialog: MatDialog,
        private jobScheduleService: JobScheduleService,
        private pinnedEntityService: PinnedEntityService,
        private taskManager: BackgroundTaskService) {
        super(changeDetector);
        this.data = this.jobScheduleService.listView();
        ComponentUtils.setActiveItem(activatedRoute, this.data);
        this.data.items.subscribe((jobSchedules) => {
            this.jobSchedules = jobSchedules;
            this.changeDetector.markForCheck();
        });
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

    public handleFilter(filter: Filter) {
        if (filter.isEmpty()) {
            this.data.setOptions({ ...this._baseOptions });
        } else {
            this.data.setOptions({ ...this._baseOptions, filter: filter.toOData() });
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

    public contextmenu(jobSchedule: JobSchedule) {
        const isCompleted = jobSchedule.state === JobScheduleState.completed;
        const isDisabled = jobSchedule.state === JobScheduleState.disabled;
        return new ContextMenu([
            new ContextMenuItem({ label: "Delete", click: () => this.deleteJobSchedule(jobSchedule) }),
            new ContextMenuItem({
                label: "Terminate",
                click: () => this.terminateJobSchedule(jobSchedule),
                enabled: !isCompleted,
            }),
            new ContextMenuItem({
                label: "Enable",
                click: () => this.enableJobSchedule(jobSchedule),
                enabled: !isCompleted && isDisabled,
            }),
            new ContextMenuItem({
                label: "Disable",
                click: () => this.disableJobSchedule(jobSchedule),
                enabled: !isCompleted && !isDisabled,
            }),
            new ContextMenuItem({
                label: this.pinnedEntityService.isFavorite(jobSchedule) ? "Unpin favorite" : "Pin to favorites",
                click: () => this._pinJobSchedule(jobSchedule),
            }),
        ]);
    }

    public deleteSelection(selection: ListSelection) {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeleteJobScheduleAction(this.jobScheduleService, [...selection.keys]);
            task.start(backgroundTask);
            return task.waitingDone;
        });
    }

    public deleteJobSchedule(jobSchedule: JobSchedule) {
        const dialogRef = this.dialog.open(DeleteJobScheduleDialogComponent);
        dialogRef.componentInstance.jobScheduleId = jobSchedule.id;
        dialogRef.afterClosed().subscribe((obj) => {
            this.jobScheduleService.get(jobSchedule.id);
        });
    }

    public terminateJobSchedule(jobSchedule: JobSchedule) {
        const dialogRef = this.dialog.open(TerminateJobScheduleDialogComponent);
        dialogRef.componentInstance.jobScheduleId = jobSchedule.id;
        dialogRef.afterClosed().subscribe((obj) => {
            this.jobScheduleService.get(jobSchedule.id);
        });
    }

    public disableJobSchedule(jobSchedule: JobSchedule) {
        const dialogRef = this.dialog.open(DisableJobScheduleDialogComponent);
        dialogRef.componentInstance.jobScheduleId = jobSchedule.id;
        dialogRef.afterClosed().subscribe((obj) => {
            this.jobScheduleService.get(jobSchedule.id);
        });
    }

    public enableJobSchedule(jobSchedule: JobSchedule) {
        const dialogRef = this.dialog.open(EnableJobScheduleDialogComponent);
        dialogRef.componentInstance.jobScheduleId = jobSchedule.id;
        dialogRef.afterClosed().subscribe((obj) => {
            this.jobScheduleService.get(jobSchedule.id);
        });
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
