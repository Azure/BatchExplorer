import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { ListDataPresenter } from "../list-data-presenter";
import { ListDataProvider } from "../list-data-provider";
import { SortingStatus } from "../list-data-sorter";

import "./partial-sort-warning.scss";

@Component({
    selector: "bl-partial-sort-warning",
    templateUrl: "partial-sort-warning.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartialSortWarningComponent implements OnInit, OnDestroy {
    public SortingStatus = SortingStatus;

    @Input() public data: ListDataProvider;
    @Input() public presenter: ListDataPresenter;

    public loadingAll: boolean;
    public autoUpdating: boolean;
    public sortingStatus: SortingStatus;

    private _sub: Subscription;
    private _presenterSubs: Subscription[] = [];

    constructor(private changeDetector: ChangeDetectorRef) {

    }

    public ngOnInit() {
        this._presenterSubs.push(this.presenter.autoUpdating.subscribe((autoUpdating) => {
            this.autoUpdating = autoUpdating;
            this.changeDetector.markForCheck();
        }));
        this._presenterSubs.push(this.presenter.sortingStatus.subscribe((sortingStatus) => {
            this.sortingStatus = sortingStatus;
            this.changeDetector.markForCheck();
        }));
    }

    public loadAll() {
        this.loadingAll = true;
        this.changeDetector.markForCheck();
        this._sub = this.data.fetchAll().subscribe(() => {
            this.loadingAll = false;
            this.presenter.update();
            this.changeDetector.markForCheck();
        });
    }

    public update() {
        this.presenter.update();
    }

    public ngOnDestroy() {
        if (this._sub) {
            this._sub.unsubscribe();
        }
        this._presenterSubs.forEach(x => x.unsubscribe());
    }
}
