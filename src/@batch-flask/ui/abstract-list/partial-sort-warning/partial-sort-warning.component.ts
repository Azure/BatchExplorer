import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from "@angular/core";
import { ListView } from "@batch-flask/core";
import { Subscription } from "rxjs";

import "./partial-sort-warning.scss";

@Component({
    selector: "bl-partial-sort-warning",
    templateUrl: "partial-sort-warning.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartialSortWarningComponent implements OnDestroy {
    @Input() public data: ListView<any, any>;

    public loadingAll: boolean;
    private _sub: Subscription;

    constructor(private changeDetector: ChangeDetectorRef) {

    }
    public loadAll() {
        this.loadingAll = true;
        this.changeDetector.markForCheck();
        this._sub = this.data.fetchAll().subscribe(() => {
            this.loadingAll = false;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }
}
