import { Component, Input } from "@angular/core";

import { AdvancedFilter } from "./advanced-filter";

@Component({
    selector: "bex-adv-filter",
    template: `
        <form [formGroup]="advancedFilter.group" *ngIf="advancedFilter">
            <ng-content></ng-content>
        </form>
    `,
})
export class AdvancedFilterComponent {
    @Input()
    public advancedFilter: AdvancedFilter;
}
