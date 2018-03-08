import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { Filter } from "@batch-flask/core";
import { LoadingStatus } from "@batch-flask/ui/loading";

@Component({
    selector: "bl-no-item",
    template: `
        <div
            class="no-item-message"
            [class.slim]="slimline"
            *ngIf="status !== LoadingStatus.Loading && itemCount === 0">

            <ng-content select="[icon]"></ng-content>
            <ng-content select="[no-filter]" *ngIf="!withFilter"></ng-content>
            <ng-content select="[with-filter]" *ngIf="withFilter"></ng-content>
            <ng-content select="[description]"></ng-content>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoItemComponent {
    @Input() public status: LoadingStatus = LoadingStatus.Ready;

    @Input() public itemCount: number;

    @Input() public set filter(filter: Filter) {
        this.withFilter = Boolean(filter && !filter.isEmpty());
    }

    @Input() public slimline = false;

    public withFilter = false;
    public LoadingStatus = LoadingStatus;
}
