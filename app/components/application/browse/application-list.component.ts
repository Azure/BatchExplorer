import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router } from "@angular/router";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { ContextMenu, ContextMenuItem } from "app/components/base/context-menu";
import { LoadingStatus } from "app/components/base/loading";
import { QuickListItemStatus } from "app/components/base/quick-list";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { BatchApplication } from "app/models";
import { ApplicationListParams, ApplicationService, PinnedEntityService } from "app/services";
import { ListView } from "app/services/core";
import { Filter } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";
import { ApplicationEditDialogComponent, DeleteApplicationDialogComponent } from "../action";

@Component({
    selector: "bl-application-list",
    templateUrl: "application-list.html",
})
export class ApplicationListComponent extends ListOrTableBase implements OnInit, OnDestroy {
    public status: Observable<LoadingStatus>;
    public data: ListView<BatchApplication, ApplicationListParams>;
    public applications: List<BatchApplication>;
    public displayedApplications: List<BatchApplication>;

    @Input()
    public quickList: boolean;

    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;
        this._filterApplications();
    }
    public get filter(): Filter { return this._filter; }

    private _baseOptions = { maxresults: 50 };
    private _subs: Subscription[] = [];
    private _filter: Filter;

    constructor(
        router: Router,
        protected dialog: MatDialog,
        private applicationService: ApplicationService,
        private pinnedEntityService: PinnedEntityService,
        private sidebarManager: SidebarManager) {

        super();

        this.data = this.applicationService.listView(this._baseOptions);
        this._subs.push(this.data.items.subscribe((applications) => {
            this.applications = applications;
            this._filterApplications();
        }));

        this.status = this.data.status;
        this._subs.push(applicationService.onApplicationAdded.subscribe((applicationId) => {
            this.data.loadNewItem(applicationService.get(applicationId));
        }));
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.data.refresh();
    }

    public appStatus(application: BatchApplication): QuickListItemStatus {
        return application.allowUpdates
            ? QuickListItemStatus.lightaccent
            : QuickListItemStatus.accent;
    }

    public appStatusText(application: BatchApplication): string {
        return application.allowUpdates
            ? "Application allows updates"
            : "Application is locked";
    }

    public onScrollToBottom(x) {
        this.data.fetchNext();
    }

    public contextmenu(application: BatchApplication) {
        return new ContextMenu([
            new ContextMenuItem({
                label: "Delete",
                click: () => this._deleteApplication(application),
                enabled: application.allowUpdates,
            }),
            new ContextMenuItem({
                label: "Edit",
                click: () => this._editApplication(application),
            }),
            new ContextMenuItem({
                label: this.pinnedEntityService.isFavorite(application) ? "Unpin favorite" : "Pin to favorites",
                click: () => this._pinApplication(application),
            }),
        ]);
    }

    public trackByFn(index, application: BatchApplication) {
        return application.id;
    }

    private _filterApplications() {
        let text: string = null;
        if (this._filter && this._filter.properties.length > 0) {
            text = (this._filter.properties[0] as any).value;
            text = text && text.toLowerCase();
        }

        this.displayedApplications = List<BatchApplication>(this.applications.filter((app) => {
            return !text || app.id.toLowerCase().indexOf(text) !== -1;
        }));
    }

    private _editApplication(application: BatchApplication) {
        const sidebarRef = this.sidebarManager.open("edit-application", ApplicationEditDialogComponent);
        sidebarRef.component.setValue(application);
        sidebarRef.afterCompletion.subscribe(() => {
            this.refresh();
        });
    }

    private _deleteApplication(application: BatchApplication) {
        const dialogRef = this.dialog.open(DeleteApplicationDialogComponent);
        dialogRef.componentInstance.applicationId = application.id;
    }

    private _pinApplication(application: BatchApplication) {
        this.pinnedEntityService.pinFavorite(application).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(application);
            }
        });
    }
}
