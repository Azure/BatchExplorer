import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Set } from "immutable";

import { ListAndShowLayoutComponent } from "app/components/base/list-and-show-layout";
import { autobind } from "app/core";
import { Subscription } from "app/models";
import { SubscriptionService } from "app/services";
import { Filter, FilterBuilder } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";

@Component({
    selector: "bl-account-home",
    templateUrl: "account-home.html",
})
export class AccountHomeComponent implements OnInit, OnDestroy {

    @ViewChild("layout")
    public layout: ListAndShowLayoutComponent;

    public subscriptionIds = new FormControl();

    private _subs = [];

    constructor(public subscriptionService: SubscriptionService, private sidebarManager: SidebarManager) {

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

    @autobind()
    public addBatchAccount() {
        // this.sidebarManager.open("add-pool", AccountCreateBasicDialogComponent);
    }

    private _buildSubscriptionFilter(subscriptionIds: Set<string>): Filter {
        if (subscriptionIds.size === 0) {
            return FilterBuilder.none();
        }

        const filters = subscriptionIds.map(id => FilterBuilder.prop("subscriptionId").eq(id));
        return FilterBuilder.or(...filters.toArray());
    }
}
