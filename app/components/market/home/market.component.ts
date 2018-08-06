import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { Application } from "app/models";
import { GithubDataService, NcjTemplateService } from "app/services";
import { AutoStorageService } from "app/services/storage";
import { List } from "immutable";
import { Subscription } from "rxjs";
import { flatMap } from "rxjs/operators";
import "./market.scss";

@Component({
    selector: "bl-market",
    templateUrl: "market.html",
})
export class MarketComponent implements OnInit, OnDestroy {
    public static breadcrumb() {
        return { name: "Gallery" };
    }

    public query: string = "";
    public applications: List<Application>;
    public displayedApplications: List<Application>;
    public quicksearch = new FormControl("");

    private _subs: Subscription[] = [];

    constructor(
        public githubDataService: GithubDataService,
        public autoStorageService: AutoStorageService,
        private templateService: NcjTemplateService) {
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
        const obs = this.githubDataService.reloadData().pipe(flatMap(() => {
            return this.templateService.listApplications();
        }));

        obs.subscribe((applications) => {
            this.applications = applications;
            this._filterApplications();
        });

        return obs;
    }

    public trackApplication(index, action: Application) {
        return action.id;
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
