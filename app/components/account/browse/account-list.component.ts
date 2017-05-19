import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { Observable } from "rxjs";

import { AccountResource } from "app/models";
import { AccountService, SubscriptionService } from "app/services";
import { Filter, FilterBuilder, FilterMatcher, Operator } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";

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
    public get filter(): Filter { return this._filter; }

    public displayedAccounts: Observable<List<AccountResource>>;

    private _filter: Filter = FilterBuilder.none();

    constructor(
        private accountService: AccountService,
        activatedRoute: ActivatedRoute,
        sidebarManager: SidebarManager,
        subscriptionService: SubscriptionService) {
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
            const matcher = new FilterMatcher<AccountResource>({
                id: (item: AccountResource, value: any, operator: Operator) => {
                    return value === "" || item.name.toLowerCase().startsWith(value.toLowerCase());
                },
                subscriptionId: (item: AccountResource, value: any, operator: Operator) => {
                    return value === "" || item.subscription.subscriptionId === value;
                },
            });

            return List<AccountResource>(accounts.filter((x) => {
                return matcher.test(this._filter, x);
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
