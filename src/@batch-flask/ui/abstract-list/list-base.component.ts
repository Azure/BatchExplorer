import { LiveAnnouncer } from "@angular/cdk/a11y";
import { ChangeDetectorRef, Directive, Injector, Input, OnDestroy, ViewChild } from "@angular/core";
import { I18nService, ListSelection, SelectableList } from "@batch-flask/core";
import { Filter, FilterBuilder } from "@batch-flask/core/filter-builder";
import { LoadingStatus } from "@batch-flask/ui/loading/loading-status";
import { Observable, Subscription } from "rxjs";
import { AbstractListBase } from "./abstract-list-base";

export interface ListBaseComponent {
    // Optional methods
    deleteSelection?(selection: ListSelection);

    refresh?(): Observable<any>;

    handleFilter?(filter: Filter): Observable<number>;

    onScrollToBottom?();
}

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class ListBaseComponent extends SelectableList implements OnDestroy {
    @Input() public set quicklist(quicklist: boolean) {
        this._quicklist = quicklist;
        this.changeDetector.markForCheck();
    }
    public get quicklist() { return this._quicklist; }

    @Input() public set filter(filter: Filter) {
        this._filter = filter;
        if (this._applyFilterSub) { this._applyFilterSub.unsubscribe(); }
        this._applyFilterSub = this.handleFilter(filter).subscribe((count) => {
            let message: string;
            if (filter.isEmpty()) {
                message = this.i18n.t("list-base.filterCleared", { count });
            } else {
                message = this.i18n.t("list-base.filterApplied", { count });
            }
            this.liveAnnouncer.announce(message);
        });
        this.changeDetector.markForCheck();
    }
    public get filter() { return this._filter; }

    @Input() public set status(status: LoadingStatus) {
        this._status = status;
        this.changeDetector.markForCheck();
    }
    public get status() { return this._status; }
    public _applyFilterSub: Subscription;

    @ViewChild(AbstractListBase, { static: false })
    public list: AbstractListBase;

    private i18n: I18nService;

    private liveAnnouncer: LiveAnnouncer;

    private _filter: Filter = FilterBuilder.none();
    private _status: LoadingStatus = LoadingStatus.Loading;
    private _quicklist: boolean = false;

    constructor(injector: Injector) {
        super(injector.get(ChangeDetectorRef));
        this.liveAnnouncer = injector.get(LiveAnnouncer);
        this.i18n = injector.get(I18nService);
    }

    public ngOnDestroy() {
        if (this._applyFilterSub) { this._applyFilterSub.unsubscribe(); }
    }
}
