import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { Filter, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { ContextMenu, ContextMenuItem } from "@batch-flask/ui/context-menu";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { SidebarManager } from "@batch-flask/ui/sidebar/sidebar-manager";
import { JobSchedule, JobScheduleState } from "app/models";
import { JobScheduleListParams, JobScheduleService, PinnedEntityService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";
import {
    DeleteJobScheduleAction,
    DeleteJobScheduleDialogComponent,
    DisableJobScheduleDialogComponent,
    EnableJobScheduleDialogComponent,
    PatchJobScheduleComponent,
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

    public data: ListView<JobSchedule, JobScheduleListParams>;
    public searchQuery = new FormControl();

    private _baseOptions = {};
    private _onJobScheduleAddedSub: Subscription;

    constructor(
        router: Router,
        activatedRoute: ActivatedRoute,
        changeDetector: ChangeDetectorRef,
        private sidebarManager: SidebarManager,
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
            new ContextMenuItem({
                label: "Edit",
                click: () => this.editJobSchedule(jobSchedule),
                enabled: !isCompleted,
            }),
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

    public editJobSchedule(jobSchedule: JobSchedule) {
        const ref = this.sidebarManager
            .open(`edit-job-schedule-${jobSchedule.id}`, PatchJobScheduleComponent);
        ref.component.jobScheduleId = jobSchedule.id;
        ref.component.setValueFromEntity(jobSchedule);
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
