import { ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Application } from "app/models";
import { GithubDataService } from "app/services";
import { AutoStorageService } from "app/services/storage";
import { List } from "immutable";
import { Subscription } from "rxjs";
import "./market.scss";

@Component({
    selector: "bl-market",
    templateUrl: "market.html",
})
export class MarketComponent implements  OnDestroy {
    public static breadcrumb() {
        return { name: "Gallery" };
    }

    public query: string = "";
    public applications: List<Application>;
    public displayedApplications: List<Application>;
    public quicksearch = new FormControl("");

    private _subs: Subscription[] = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        public githubDataService: GithubDataService,
        public autoStorageService: AutoStorageService) {

        this._subs.push(this.quicksearch.valueChanges.subscribe((query) => {
            this.query = query;
            this.changeDetector.markForCheck();
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
        this._subs = [];
    }

    public trackApplication(index, action: Application) {
        return action.id;
    }
}
