import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { LoadingStatus } from "../loading-status";

@Component({
    selector: "bl-list-loading",
    templateUrl: "list-loading.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListLoadingComponent {
    @Input() public data: any;

    @Input() public status: LoadingStatus;
}
