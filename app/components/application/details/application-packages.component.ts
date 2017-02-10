import { Component, Input, OnChanges, OnDestroy, ViewChild, ViewContainerRef } from "@angular/core";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { List } from "immutable";
import * as moment from "moment";

import { DeleteSelectedItemsDialogComponent } from "app/components/base/list-and-show-layout";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { TableComponent } from "app/components/base/table";
import { Application, ApplicationPackage, PackageState } from "app/models";
import { Filter } from "app/utils/filter-builder";

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

    private _filter: Filter;
    private _application: Application;
    private _stateMap: Map<string, PackageState>;

    constructor(
        private viewContainerRef: ViewContainerRef,
        private dialog: MdDialog) {

        super();
        this._stateMap = new Map();
    }

    public ngOnChanges(inputs) {
        if (inputs.application) {
            this._stateMap.clear();
            this.application.packages.map((pkg) => {
                this._stateMap.set(pkg.version, pkg.state);
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

    public isPackagePending(version: string): boolean {
        return version
            ? this._stateMap.get(version) === PackageState.pending
            : false;
    }

    public deleteSelected() {
        console.log("DELETE SELECTED");
        // this.taskManager.startTask("", (backgroundTask) => {
        //     const task = new DeleteJobAction(this.jobService, this.selectedItems);
        //     task.start(backgroundTask);
        //     return task.waitingDone;
        // });
    }

    // todo: move me into ListOrTableBase?
    public deleteSelectedItems() {
        let config = new MdDialogConfig();
        const dialogRef = this.dialog.open(DeleteSelectedItemsDialogComponent, config);
        dialogRef.componentInstance.items = this.selectedItems;
        dialogRef.afterClosed().subscribe((proceed) => {
            if (proceed) {
                this.deleteSelected();
                // clear selection doesnt work except for quicklist
                // this.clearSelection();
            }
        });
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
