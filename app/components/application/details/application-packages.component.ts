import { Component, Input, OnDestroy, ViewContainerRef } from "@angular/core";
import { List } from "immutable";
import * as moment from "moment";

import { Application, ApplicationPackage } from "app/models";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bex-application-packages",
    templateUrl: "application-packages.html",
})

export class ApplicationPackagesComponent implements OnDestroy {
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

    constructor(
        private viewContainerRef: ViewContainerRef) {
    }

    public ngOnDestroy() {
        /* tab hide */
    }

    public formatDate(date: Date) {
        return moment(date).format("MMM Do, YYYY, HH:mm:ss");
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
