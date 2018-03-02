import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Set } from "immutable";

import { Filter, FilterBuilder } from "@batch-flask/core";
import { BrowseLayoutComponent } from "@batch-flask/ui/browse-layout";
import { Subscription } from "app/models";
import { SubscriptionService } from "app/services";

@Component({
    selector: "bl-account-home",
    templateUrl: "account-home.html",
})
export class AccountHomeComponent implements OnInit, OnDestroy {

    @ViewChild("layout")
    public layout: BrowseLayoutComponent;

    public subscriptionIds = new FormControl();

    private _subs = [];

    constructor(public subscriptionService: SubscriptionService) {

    }

    public ngOnInit() {
        this._subs.push(this.subscriptionService.accountSubscriptionFilter.distinctUntilChanged()
            .subscribe((subscriptionIds) => {
                this.subscriptionIds.setValue(subscriptionIds.toJS());
                this.layout.advancedFilterChanged(this._buildSubscriptionFilter(subscriptionIds));
            }));

        this._subs.push(this.subscriptionIds.valueChanges.subscribe((subscriptionIds) => {
            this.subscriptionService.setAccountSubscriptionFilter(Set<string>(subscriptionIds));
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public trackByFn(index, subscription: Subscription) {
        return subscription.id;
    }

    private _buildSubscriptionFilter(subscriptionIds: Set<string>): Filter {
        if (subscriptionIds.size === 0) {
            return FilterBuilder.none();
        }

        const filters = subscriptionIds.map(id => FilterBuilder.prop("subscriptionId").eq(id));
        return FilterBuilder.or(...filters.toArray());
    }
}
