import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
    HostBinding, Inject, Injector, Input, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import { SortDirection } from "@batch-flask/ui/abstract-list";
import { ClickableComponent } from "@batch-flask/ui/buttons";
import { TableColumnRef } from "@batch-flask/ui/table/table-column-manager";
import { TableComponent } from "@batch-flask/ui/table/table.component";
import { Subscription } from "rxjs";

import "./table-head-cell.scss";

@Component({
    selector: "bl-table-head-cell",
    templateUrl: "table-head-cell.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeadCellComponent extends ClickableComponent implements OnInit, OnDestroy {
    public SortDirection = SortDirection;

    @Input() public column: TableColumnRef;
    public width: number | null;

    @HostBinding("class.sortable")
    public get sortable() {
        return this.column.sortable || (this.table.config.sorting && this.column.name in this.table.config.sorting);
    }

    @HostBinding("class.fixed-size")
    public get fixedSize() {
        return this.width;
    }

    @HostBinding("style.flex-basis.px")
    public get flexBasis() {
        return this.width;
    }

    @HostBinding("style.min-width.px")
    public get minWidth() {
        return this.column.minWidth;
    }

    @HostBinding("style.max-width.px")
    public get maxWidth() {
        return this.column.maxWidth;
    }

    @HostBinding("attr.id") public get id() {
        return this.column.id;
    }

    @HostBinding("attr.tabindex")
    public get tabIndex() {
        // Remove column from tab order if it has no content
        return this.elementRef.nativeElement.innerText.trim() === "" ? -1 : 0;
    }

    public sortDirection: SortDirection;

    @HostBinding("class.sorting")
    public isSorting: boolean = false;

    // Aria
    @HostBinding("attr.role") public readonly role = "columnheader";
    @HostBinding("attr.aria-sort") public get ariaSort() {
        if (this.sortable) {
            if (this.isSorting) {
                return this.sortDirection === SortDirection.Asc ? "ascending" : "descending";
            } else {
                return "none";
            }
        } else {
            return null;
        }
    }
    private _subs: Subscription[] = [];

    constructor(
        injector: Injector,
        @Inject(forwardRef(() => TableComponent)) public table: any,
        public elementRef: ElementRef,
        private changeDetector: ChangeDetectorRef) {
        super(injector, null);
    }

    public ngOnInit() {
        this.width = this.table.columnManager.getColumnWidth(this.column.name);

        this._subs.push(this.table.columnManager.sorting.subscribe((sortingInfo) => {
            this.isSorting = sortingInfo.key === this.column.name;
            if (this.isSorting) {
                this.sortDirection = sortingInfo.direction;
            } else {
                this.sortDirection = SortDirection.Asc;
            }
            this.changeDetector.markForCheck();
        }));

        this._subs.push(this.table.columnManager.dimensionsChange.subscribe(() => {
            this.width = this.table.columnManager.getColumnWidth(this.column.name);
            this.changeDetector.markForCheck();
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public handleAction(event: Event) {
        event.stopPropagation();
        super.handleAction(event);
        if (!this.sortable) {
            return;
        }

        if (this.isSorting) {
            this._invertOrder();
        } else {
            this.table.columnManager.sortBy(this.column.name);
        }
    }

    private _invertOrder() {
        let invertedDirection;
        if (this.sortDirection === SortDirection.Desc) {
            invertedDirection = SortDirection.Asc;
        } else {
            invertedDirection = SortDirection.Desc;
        }

        this.table.columnManager.sortBy(this.column.name, invertedDirection);
    }
}
