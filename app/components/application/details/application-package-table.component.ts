import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import { BackgroundTaskService } from "app/components/base/background-task";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { ApplicationPackage, BatchApplication, PackageState } from "app/models";
import { ApplicationService } from "app/services";
import { DateUtils } from "app/utils";
import { Filter } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";
import { ActivatePackageDialogComponent, ApplicationCreateDialogComponent, DeletePackageAction } from "../action";

@Component({
    selector: "bl-application-package-table",
    templateUrl: "application-package-table.html",
})
export class ApplicationPackageTableComponent extends ListOrTableBase implements OnChanges, OnDestroy {
    @Input()
    public set application(application: BatchApplication) {
        this._application = application;
        if (this.application) {
            this.entityParentId = this.application.id;
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
    public get filter(): Filter { return this._filter; }

    public packages: List<ApplicationPackage>;
    public displayedPackages: List<ApplicationPackage>;

    // enabled handlers for the UI
    public deleteItemEnabled = new BehaviorSubject<boolean>(false);
    public activateItemEnabled = new BehaviorSubject<boolean>(false);
    public editItemEnabled = new BehaviorSubject<boolean>(false);

    private _filter: Filter;
    private _application: BatchApplication;
    private _stateMap: Map<string, PackageState>;
    private _subs: Subscription[] = [];

    constructor(
        protected dialog: MatDialog,
        private applicationService: ApplicationService,
        private sidebarManager: SidebarManager,
        private taskManager: BackgroundTaskService) {

        super(dialog);
        this._stateMap = new Map();
        this.entityName = "application packages";
        this._subs.push(this.selectedItemsChange.subscribe((items) => {
            if (items.length !== 1) {
                this.activateItemEnabled.next(false);
                this.editItemEnabled.next(false);
            }
        }));

        this._subs.push(this.activatedItemChange.subscribe((activatedItem) => {
            this.activateItemEnabled.next(this._activatedItemActivateEnabled(activatedItem.key));
            this.deleteItemEnabled.next(this.application.allowUpdates && this.isAnyItemSelected());
            this.editItemEnabled.next(this._activatedItemEditEnabled(activatedItem.key));
        }));
    }

    public ngOnChanges(inputs) {
        if (!inputs.application.previousValue ||
            inputs.application.currentValue.id !== inputs.application.previousValue.id) {
            this._stateMap.clear();
            this.application.packages.map((pkg) => {
                this._stateMap.set(pkg.version, pkg.state);
            });

            setTimeout(() => {
                this._resetSubjects();
            });
        }
    }

    public ngOnDestroy(): void {
        this._subs.forEach(x => x.unsubscribe());
    }

    public formatDate(date: Date) {
        return DateUtils.fullDateAndTime(date);
    }

    public addPackage(event: any) {
        const sidebarRef = this.sidebarManager.open("add-package", ApplicationCreateDialogComponent);
        sidebarRef.component.setValue(this.application);
        sidebarRef.afterCompletion.subscribe(() => {
            this.refresh();
        });
    }

    @autobind()
    public deleteSelected() {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeletePackageAction(this.applicationService, this.application.id, this.selectedItems);
            task.start(backgroundTask);
            return task.waitingDone;
        }).subscribe((done) => {
            if (done) {
                this.refresh();
            }
        });
    }

    public refresh(): Observable<any> {
        return this.applicationService.get(this.application.id);
    }

    @autobind()
    public activateActiveItem() {
        const dialogRef = this.dialog.open(ActivatePackageDialogComponent);
        dialogRef.componentInstance.applicationId = this.application.id;
        dialogRef.componentInstance.packageVersion = this.activatedItem;
        dialogRef.afterClosed().subscribe((obj) => {
            this.refresh();
        });
    }

    @autobind()
    public updatePackageVersion() {
        const sidebarRef = this.sidebarManager.open("update-package", ApplicationCreateDialogComponent);
        sidebarRef.component.setValue(this.application, this.activatedItem);
        sidebarRef.afterCompletion.subscribe(() => {
            this.refresh();
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
            text = (this._filter as any).value;
            text = text && text.toLowerCase();
        }

        this.displayedPackages = List<ApplicationPackage>(this.packages.filter((app) => {
            return !text || app.version.toLowerCase().indexOf(text) !== -1;
        }));
    }
}
