import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { LoadingStatus } from "@batch-flask/core";
import { BehaviorSubject, Subject, Subscription, combineLatest } from "rxjs";
import { takeUntil } from "rxjs/operators";
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

    @Input() public data: ListDataProvider;
    @Input() public presenter: ListDataPresenter;

    public loadingAll: boolean;
    public showWarning = false;
    public autoUpdating: boolean;

    private _sub: Subscription;
    private _loadingAll = new BehaviorSubject(false);
    private _destroy = new Subject();

    constructor(private changeDetector: ChangeDetectorRef) {

    }

    public ngOnInit() {
        this.presenter.autoUpdating.pipe(takeUntil(this._destroy)).subscribe((autoUpdating) => {
            this.autoUpdating = autoUpdating;
            this.changeDetector.markForCheck();
        });

        this._loadingAll.pipe(takeUntil(this._destroy)).subscribe((value) => {
            this.loadingAll = value;
            this.changeDetector.markForCheck();
        });

        combineLatest(this.data.status, this.presenter.sortingStatus, this._loadingAll).pipe(
            takeUntil(this._destroy),
        ).subscribe(([status, sortingStatus, loadingAll]) => {
            const partial = status !== LoadingStatus.Loading && sortingStatus === SortingStatus.Partial;
            this.showWarning = loadingAll || partial;
            this.changeDetector.markForCheck();
        });
    }

    public loadAll() {
        this._loadingAll.next(true);
        this.changeDetector.markForCheck();
        this._sub = this.data.fetchAll().subscribe(() => {
            this._loadingAll.next(false);
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
        this._destroy.next();
        this._destroy.complete();
    }
}
