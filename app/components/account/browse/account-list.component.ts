import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { AccountResource, Subscription } from "app/models";
import { AccountService, SubscriptionService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Property } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";

interface SubscriptionAccount {
    expanded: boolean;
    accounts: RxListProxy<any, AccountResource>;
}

@Component({
    selector: "bex-account-list",
    templateUrl: "account-list.html",
})
export class AccountListComponent implements OnInit {
    public subscriptions: RxListProxy<{}, Subscription>;

    public subscriptionAccounts: { [subId: string]: SubscriptionAccount } = {};
    @Input()
    public set filter(filter: Property) {
        this._filter = filter;
    }
    public get filter(): Property { return this._filter; };

    private _filter: Property;

    constructor(
        private accountService: AccountService,
        private subscriptionService: SubscriptionService,
        private sidebarManager: SidebarManager,
        private activatedRoute: ActivatedRoute) {
        this.subscriptions = subscriptionService.list();
        this.subscriptions.items.subscribe((subscriptions) => {
            const data: any = {};
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
        });
    }

    public ngOnInit() {
        this.subscriptions.fetchNext(true);
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
}
