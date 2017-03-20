import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { List } from "immutable";
import { Subscription as RxjsSubscription } from "rxjs";

import { AccountResource, Subscription } from "app/models";
import { AccountService, SubscriptionService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";

interface SubscriptionAccount {
    expanded: boolean;
    accounts: RxListProxy<any, AccountResource>;
}

@Component({
    selector: "bl-account-list",
    templateUrl: "account-list.html",
})
export class AccountListComponent implements OnInit, OnDestroy {
    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;
        this._updateDisplayedSubscriptions();
    }
    public get filter(): Filter { return this._filter; };

    public subscriptionData: RxListProxy<{}, Subscription>;
    public subscriptionAccounts: { [subId: string]: SubscriptionAccount } = {};
    public subscriptions: List<Subscription>;
    public displayedSubscriptions: List<Subscription>;

    private _filter: Filter;
    private _sub: RxjsSubscription;

    constructor(
        private accountService: AccountService,
        private activatedRoute: ActivatedRoute,
        private sidebarManager: SidebarManager,
        private subscriptionService: SubscriptionService) {

        this.subscriptionData = subscriptionService.list();
        this._sub = this.subscriptionData.items.subscribe((subscriptions) => {
            const data: any = {};
            this.subscriptions = List<Subscription>(subscriptions.sort((a, b) => {
                if (a.displayName < b.displayName) {
                    return -1;
                } else if (a.displayName > b.displayName) {
                    return 1;
                }
                return 0;
            }));

            subscriptions.forEach((subscription) => {
                if (subscription.subscriptionId in this.subscriptionAccounts) {
                    data[subscription.subscriptionId] = this.subscriptionAccounts[subscription.subscriptionId];
                } else {
                    data[subscription.subscriptionId] = {
                        expanded: false,
                        accounts: null,
                    };
                }
            });

            this.subscriptionAccounts = data;
            this._updateDisplayedSubscriptions();
        });
    }

    public ngOnInit() {
        this.subscriptionData.fetchNext(true);
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public toggleExpandSubscription(subscriptionId: string) {
        const subscriptionAccounts = this.subscriptionAccounts[subscriptionId];
        if (!subscriptionAccounts.expanded) {
            if (!subscriptionAccounts.accounts) {
                subscriptionAccounts.accounts = this.accountService.list(subscriptionId);
                subscriptionAccounts.accounts.fetchNext(true);
            }
        }

        subscriptionAccounts.expanded = !subscriptionAccounts.expanded;
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

    private _updateDisplayedSubscriptions() {
        let text: string = null;
        if (this._filter && this._filter.properties.length > 0) {
            text = (this._filter.properties[0] as any).value;
            text = text && text.toLowerCase();
        }

        this.displayedSubscriptions = List<Subscription>(this.subscriptions.filter((sub) => {
            return !text || sub.displayName.toLowerCase().indexOf(text) !== -1;
        }));
    }
}
