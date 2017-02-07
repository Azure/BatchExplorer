import { Component, Input, OnChanges } from "@angular/core";
import { Subscription } from "rxjs";

import { AdvancedFilter } from "./advanced-filter";

@Component({
    selector: "bex-adv-filter",
    template: `
        <form [formGroup]="advancedFilter.group" *ngIf="advancedFilter">
            <div class="odata-preview">
                <div class="label">OData filter</div>
                <div class="value">{{currentOData}}</div>
            </div>
            <ng-content></ng-content>
        </form>
    `,
})
export class AdvancedFilterComponent implements OnChanges {
    @Input()
    public advancedFilter: AdvancedFilter;

    public currentOData: string;

    private _sub: Subscription;

    public ngOnChanges(inputs) {
        this._cleanSubscription();
        this._sub = this.advancedFilter.filterChange.subscribe((filter) => {
            if (filter.isEmpty()) {
                this.currentOData = "None";
            } else {
                this.currentOData = filter.toOData();
            }
        });
    }

    private _cleanSubscription() {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }
}
