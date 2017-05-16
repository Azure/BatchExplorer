import { Component, OnDestroy, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Subscription } from "rxjs";

import { ListAndShowLayoutComponent } from "app/components/base/list-and-show-layout";
import { SubscriptionService } from "app/services";
import { FilterBuilder, Filter } from "app/utils/filter-builder";

@Component({
    selector: "bl-account-home",
    templateUrl: "account-home.html",
})
export class AccountHomeComponent implements OnDestroy {

    @ViewChild("layout")
    public layout: ListAndShowLayoutComponent;

    public subscriptionIds = new FormControl();

    private _sub: Subscription;

    constructor(public subscriptionService: SubscriptionService) {
        this._sub = this.subscriptionIds.valueChanges.subscribe((subscriptionIds) => {
            this.layout.advancedFilterChanged(this._buildSubscriptionFilter(subscriptionIds));
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    private _buildSubscriptionFilter(subscriptionIds: string[]): Filter {
        if (subscriptionIds.length === 0) {
            return FilterBuilder.none();
        }

        const filters = subscriptionIds.map(id => FilterBuilder.prop("subscriptionId").eq(id));
        return FilterBuilder.or(...filters);
    }
}
