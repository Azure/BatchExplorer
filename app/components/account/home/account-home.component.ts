import { Component, OnDestroy, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Subscription } from "rxjs";

import { ListAndShowLayoutComponent } from "app/components/base/list-and-show-layout";
import { SubscriptionService } from "app/services";
import { FilterBuilder } from "app/utils/filter-builder";

@Component({
    selector: "bl-account-home",
    templateUrl: "account-home.html",
})
export class AccountHomeComponent implements OnDestroy {

    @ViewChild("layout")
    public layout: ListAndShowLayoutComponent;

    public subscriptionId = new FormControl();

    private _sub: Subscription;

    constructor(public subscriptionService: SubscriptionService) {
        this._sub = this.subscriptionId.valueChanges.subscribe((subscriptionId) => {
            const filter = subscriptionId
                ? FilterBuilder.prop("subscriptionId").eq(subscriptionId)
                : FilterBuilder.none();
            this.layout.advancedFilterChanged(filter);
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }
}
