import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { Observable } from "rxjs";

import { AccountResource } from "app/models";
import { AccountService, SubscriptionService } from "app/services";
import { Filter, FilterBuilder, Property } from "app/utils/filter-builder";
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
export class AccountListComponent {
    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;
        this._updateDisplayedAccounts();
    }
    public get filter(): Filter { return this._filter; };

    public displayedAccounts: Observable<List<AccountResource>>;

    private _filter: Filter = FilterBuilder.none();

    constructor(
        private accountService: AccountService,
        private activatedRoute: ActivatedRoute,
        private sidebarManager: SidebarManager,
        private subscriptionService: SubscriptionService) {
        this._updateDisplayedAccounts();
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.accountService.load();
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
                    case "subscriptionId":
                        return (x) => value === "" || x.subscription.subscriptionId === value;
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
            }).sort((a, b) => {
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                }
                return 0;
            }));
        });
    }
}
