import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { LoadingStatus } from "app/components/base/loading";
import { Filter } from "app/utils/filter-builder";

@Component({
    selector: "bex-no-item",
    template: `
        <div class="no-item-message" *ngIf="status !== loadingStatuses.Loading && itemCount === 0">
            <ng-content select="[icon]"></ng-content>
            <ng-content select="[no-filter]" *ngIf="!withFilter"></ng-content>
            <ng-content select="[with-filter]" *ngIf="withFilter"></ng-content>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoItemComponent {
    @Input()
    public status: LoadingStatus;

    @Input()
    public itemCount: number;

    @Input()
    public set filter(filter: Filter) {
        this.withFilter = Boolean(filter && !filter.isEmpty());
    }

    public withFilter = false;

    public loadingStatuses = LoadingStatus;

}
