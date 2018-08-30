import { ChangeDetectionStrategy, Component } from "@angular/core";

import "./partial-sort-warning.scss";

@Component({
    selector: "bl-partial-sort-warning",
    templateUrl: "partial-sort-warning.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartialSortWarningComponent {
}
