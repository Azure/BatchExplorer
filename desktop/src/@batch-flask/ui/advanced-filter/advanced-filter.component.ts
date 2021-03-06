import { Component, Input, OnChanges } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { log } from "@batch-flask/utils";
import { Subscription } from "rxjs";
import { AdvancedFilter } from "./advanced-filter";

@Component({
    selector: "bl-adv-filter",
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
    private _urlFilter: any = null;
    private _setUrlFilter = false;

    constructor(activatedRoute: ActivatedRoute) {
        activatedRoute.queryParams.subscribe((params: any) => {
            if (params.filter) {
                try {
                    this._urlFilter = JSON.parse(params.filter);
                } catch (e) {
                    log.warn("Invalid filter", params.filter);
                }
            }
        });
    }
    public ngOnChanges(inputs) {
        this._cleanSubscription();
        if (this._urlFilter && !this._setUrlFilter) {
            this.advancedFilter.group.patchValue(this._urlFilter);
            this._setUrlFilter = true;
        }
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
