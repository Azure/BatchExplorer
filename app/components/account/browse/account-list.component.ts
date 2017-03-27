import { Component, Input, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { List } from "immutable";
import { Observable, Subscription as RxjsSubscription } from "rxjs";

import { AccountResource, Subscription } from "app/models";
import { AccountService, SubscriptionService } from "app/services";
import { Filter, Property } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";

interface SubscriptionAccount {
    expanded: boolean;
    loading: boolean;
    accounts: Observable<List<AccountResource>>;
}

@Component({
    selector: "bl-account-list",
    templateUrl: "account-list.html",
})
export class AccountListComponent implements OnDestroy {
    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;
        this._updateDisplayedAccounts();
    }
    public get filter(): Filter { return this._filter; };

    public displayedAccounts: Observable<List<AccountResource>>;

    private _filter: Filter;
    private _sub: RxjsSubscription;

    constructor(
        private accountService: AccountService,
        private activatedRoute: ActivatedRoute,
        private sidebarManager: SidebarManager,
        private subscriptionService: SubscriptionService) {
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public isAccountFavorite(accountId: string) {
        return this.accountService.isAccountFavorite(accountId);
    }

    public toggleFavorite(accountId: string) {
        if (this.isAccountFavorite(accountId)) {
            this.accountService.unFavoriteAccount(accountId);
        } else {
            this.accountService.favoriteAccount(accountId);
        }
    }

    private _updateDisplayedAccounts() {
        this.displayedAccounts = this.accountService.accounts.map((accounts) => {
            const properties = this._filter.properties.filter(x => x instanceof Property) as Property[];
            const conditions = properties.map((property) => {
                const { name, value } = property;
                switch (name) {
                    case "id":
                        return (x) => value === "" || x.name.toLowerCase().startsWith(value.toLowerCase());
                    default:
                        return () => true;
                }
            });

            return List<AccountResource>(accounts.filter((x) => {
                for (let condition of conditions) {
                    if (!condition(x)) {
                        return false;
                    }
                }
                return true;
            }));
        });
    }
}
