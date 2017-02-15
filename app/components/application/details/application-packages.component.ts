import { Component, Input, OnChanges, OnDestroy, ViewChild, ViewContainerRef } from "@angular/core";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { List } from "immutable";
import * as moment from "moment";
import { BehaviorSubject } from "rxjs";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { DeleteSelectedItemsDialogComponent } from "app/components/base/list-and-show-layout";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { TableComponent } from "app/components/base/table";
import { Application, ApplicationPackage, PackageState } from "app/models";
import { ApplicationService } from "app/services";
import { Filter } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";
import { ActivatePackageDialogComponent, ApplicationCreateDialogComponent, DeletePackageAction } from "../action";

@Component({
    selector: "bex-application-packages",
    templateUrl: "application-packages.html",
})

export class ApplicationPackagesComponent extends ListOrTableBase implements OnChanges, OnDestroy {
    @ViewChild(TableComponent)
    public table: TableComponent;

    @Input()
    public set application(application: Application) {
        this._application = application;
        if (this.application) {
            this.packages = List(this.application.packages);
            this._filterPackages();
        }
    }
    public get application() { return this._application; }

    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;
        this._filterPackages();
    }
    public get filter(): Filter { return this._filter; };

    public packages: List<ApplicationPackage>;
    public displayedPackages: List<ApplicationPackage>;

    // enabled handlers for the UI
    public deleteItemEnabled = new BehaviorSubject<boolean>(false);
    public activateItemEnabled = new BehaviorSubject<boolean>(false);
    public editItemEnabled = new BehaviorSubject<boolean>(false);

    private _filter: Filter;
    private _application: Application;
    private _stateMap: Map<string, PackageState>;

    constructor(
        private applicationService: ApplicationService,
        private dialog: MdDialog,
        private sidebarManager: SidebarManager,
        private taskManager: BackgroundTaskManager,
        private viewContainerRef: ViewContainerRef) {

        super();
        this._stateMap = new Map();
        this.selectedItemsChange.subscribe((items) => {
            if (items.length > 1) {
                this.activateItemEnabled.next(false);
                this.editItemEnabled.next(false);
            }
        });

        this.activatedItemChange.subscribe((activatedItem) => {
            this.activateItemEnabled.next(this._activatedItemActivateEnabled(activatedItem.key));
            this.deleteItemEnabled.next(this.application.allowUpdates && this.isAnyItemSelected());
            this.editItemEnabled.next(this._activatedItemEditEnabled(activatedItem.key));
        });
    }

    public ngOnChanges(inputs) {
        if (inputs.application) {
            this._stateMap.clear();
            this.application.packages.map((pkg) => {
                this._stateMap.set(pkg.version, pkg.state);
            });

            setTimeout(() => {
                this._resetSubjects();
            });
        }
    }

    public ngOnDestroy() {
        /* tab hide */
    }

    public formatDate(date: Date) {
        return date
            ? moment(date).format("MMM Do, YYYY, HH:mm:ss")
            : "";
    }

    public addPackage(event: any) {
        const sidebarRef = this.sidebarManager.open("add-package", ApplicationCreateDialogComponent);
        sidebarRef.component.setValue(this.application);
        sidebarRef.afterCompletition.subscribe(() => {
            this.applicationService.getOnce(this.application.id);
        });
    }

    public deleteSelected() {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeletePackageAction(this.applicationService, this.application.id, this.selectedItems);
            task.start(backgroundTask);

            return task.waitingDone;
        });
    }

    // TODO: move me into ListOrTableBase?
    public deleteSelectedItems() {
        let config = new MdDialogConfig();
        const dialogRef = this.dialog.open(DeleteSelectedItemsDialogComponent, config);
        dialogRef.componentInstance.items = this.selectedItems;
        dialogRef.componentInstance.entityName = "Application packages";
        dialogRef.componentInstance.parentId = this.application.id;
        dialogRef.afterClosed().subscribe((proceed) => {
            if (proceed) {
                this.deleteSelected();
                // TODO :: clear selection doesnt work except for quicklist
                // this.clearSelection();
            }
        });
    }

    public activateActiveItem() {
        let config = new MdDialogConfig();
        config.viewContainerRef = this.viewContainerRef;

        const dialogRef = this.dialog.open(ActivatePackageDialogComponent, config);
        dialogRef.componentInstance.applicationId = this.application.id;
        dialogRef.componentInstance.packageVersion = this.activatedItem;
        dialogRef.afterClosed().subscribe((obj) => {
            this.applicationService.getOnce(this.application.id);
        });
    }

    public updatePackageVersion() {
        const sidebarRef = this.sidebarManager.open("update-package", ApplicationCreateDialogComponent);
        sidebarRef.component.setValue(this.application, this.activatedItem);
        sidebarRef.afterCompletition.subscribe(() => {
            this.applicationService.getOnce(this.application.id);
        });
    }

    private _activatedItemEditEnabled(activeItem: string) {
        return activeItem && this.application.allowUpdates && !this._isPackagePending(activeItem)
            && this.selectedItems.length <= 1;
    }

    private _activatedItemActivateEnabled(activeItem: string) {
        return activeItem && this._isPackagePending(activeItem) && this.selectedItems.length <= 1;
    }

    private _isPackagePending(version: string): boolean {
        return version
            ? this._stateMap.get(version) === PackageState.pending
            : false;
    }

    private _resetSubjects() {
        this.deleteItemEnabled.next(false);
        this.activateItemEnabled.next(false);
        this.editItemEnabled.next(false);
    }

    private _filterPackages() {
        let text: string = null;
        if (this._filter) {
            text = (<any>this._filter).value;
            text = text && text.toLowerCase();
        }

        this.displayedPackages = List<ApplicationPackage>(this.packages.filter((app) => {
            return !text || app.version.toLowerCase().indexOf(text) !== -1;
        }));
    }
}
