import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { Application } from "app/models";
import { NcjTemplateService } from "app/services";
import { autobind } from "core-decorators";
import "./market.scss";

@Component({
    selector: "bl-market",
    templateUrl: "market.html",
})
export class MarketComponent implements OnInit, OnDestroy {
    public static breadcrumb() {
        return { name: "Market" };
    }

    public query: string = "";
    public applications: List<Application>;
    public displayedApplications: List<Application>;
    public quicksearch = new FormControl("");

    private _subs: Subscription[] = [];

    constructor(private templateService: NcjTemplateService) {
        this._subs.push(this.quicksearch.valueChanges.subscribe((query) => {
            this.query = query;
            this._filterApplications();
        }));
    }

    public ngOnInit() {
        this.templateService.listApplications().subscribe((applications) => {
            this.applications = applications;
            this._filterApplications();
        });
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
        this._subs = [];
    }

    @autobind()
    public refreshApplications() {
        const obs = this.templateService.reloadData().flatMap(() => {
            return this.templateService.listApplications();
        });

        obs.subscribe((applications) => {
            this.applications = applications;
            this._filterApplications();
        });

        return obs;
    }

    /**
     * Filter all the application according to the current filter.
     * It will set the displayedApplication.
     */
    private _filterApplications() {
        this.displayedApplications = List(this.applications.filter((application) => {
            const query = this.query.clearWhitespace().toLowerCase();
            return query === ""
                || application.id.clearWhitespace().toLowerCase().contains(query)
                || application.name.clearWhitespace().toLowerCase().contains(query);
        }));
    }
}
