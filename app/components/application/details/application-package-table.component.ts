import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import { BackgroundTaskService } from "app/components/base/background-task";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { ApplicationPackage, BatchApplication, PackageState } from "app/models";
import { ApplicationService } from "app/services";
import { ComponentUtils, DateUtils } from "app/utils";
import { Filter } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";
import { ActivatePackageDialogComponent, ApplicationCreateDialogComponent, DeletePackageAction } from "../action";

@Component({
    selector: "bl-application-package-table",
    templateUrl: "application-package-table.html",
})
export class ApplicationPackageTableComponent extends ListOrTableBase implements OnChanges, OnDestroy {
    @Input() public application: BatchApplication;
    @Input() public filter: Filter;

    public packages: List<ApplicationPackage> = List([]);
    public displayedPackages: List<ApplicationPackage> = List([]);

    // enabled handlers for the UI
    public deleteItemEnabled = new BehaviorSubject<boolean>(false);
    public activateItemEnabled = new BehaviorSubject<boolean>(false);
    public editItemEnabled = new BehaviorSubject<boolean>(false);

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
            this.deleteItemEnabled.next(this._activatedItemDeleteEnabled(activatedItem.key));
            this.editItemEnabled.next(this._activatedItemEditEnabled(activatedItem.key));
        }));
    }

    public ngOnChanges(inputs) {
        if (inputs.application) {
            if (!this.packages.equals(this.application.packages)) {
                this._updatePackages();
            }
        } else if (inputs.filter) {
            this._filterPackages();
        }

        if (ComponentUtils.recordChangedId(inputs.application)) {
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

    public trackByFn(index, pkg: ApplicationPackage) {
        return pkg.version;
    }

    private _updatePackages() {
        if (this.application) {
            this.packages = this.application.packages;
        } else {
            this.packages = List([]);
        }
        this._filterPackages();

        this._stateMap.clear();
        this.application.packages.forEach((pkg) => {
            this._stateMap.set(pkg.version, pkg.state);
        });
    }
    private _activatedItemEditEnabled(activeItemKey: string) {
        return this.application.allowUpdates && !this._isPackagePending(activeItemKey)
            && this.selectedItems.length <= 1;
    }

    private _activatedItemDeleteEnabled(activeItemKey: any) {
        return this.application.allowUpdates && this.isAnyItemSelected() && Boolean(activeItemKey);
    }

    private _activatedItemActivateEnabled(activeItemKey: string) {
        return this._isPackagePending(activeItemKey) && this.selectedItems.length <= 1;
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
        if (this.filter) {
            text = (this.filter as any).value;
            text = text && text.toLowerCase();
        }

        this.displayedPackages = List<ApplicationPackage>(this.packages.filter((app) => {
            return !text || app.version.toLowerCase().indexOf(text) !== -1;
        }));
    }
}
