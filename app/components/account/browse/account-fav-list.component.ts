import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { List } from "immutable";
import { Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { AccountResource } from "app/models";
import { AccountService } from "app/services";
import { Property } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";

@Component({
    selector: "bl-account-fav-list",
    templateUrl: "account-fav-list.html",
})
export class AccountFavListComponent {
    public displayedAccounts: Observable<List<AccountResource>> = Observable.of(List([]));
    public status = LoadingStatus.Loading;

    @Input()
    public set filter(filter: Property) {
        this._filter = filter;
        this.displayedAccounts = this.accountService.accountFavorites.map((accounts) => {
            const query = filter.value || "";
            return List<AccountResource>(accounts.filter((x) => {
                return query === ""
                    || x.name.toLowerCase().startsWith(query);
            }));
        });
    }
    public get filter(): Property { return this._filter; }

    private _filter: Property;

    constructor(
        private accountService: AccountService,
        private sidebarManager: SidebarManager,
        private activatedRoute: ActivatedRoute) {
        accountService.accountFavorites.subscribe(() => {
            this.status = LoadingStatus.Ready;
        });
    }
}
