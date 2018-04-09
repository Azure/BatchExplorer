import {
    ChangeDetectionStrategy, Component, HostBinding, HostListener, Inject, Input, OnChanges, forwardRef,
} from "@angular/core";

import { SecureUtils } from "@batch-flask/utils";
import { TableComponent } from "../table.component";

export enum SortDirection {
    Asc,
    Desc,
}

@Component({
    selector: "bl-column",
    template: `
        <ng-content></ng-content>
        <span *ngIf="sortable" class="sort-icon">
            <span *ngIf="sortDirection === SortDirection.Asc" class="fa fa-arrow-up"></span>
            <span *ngIf="sortDirection === SortDirection.Desc" class="fa fa-arrow-down"></span>
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class TableColumnComponent implements OnChanges {
    public SortDirection = SortDirection;

    @Input() public defaultWidth: number = null;

    @HostBinding("class.sortable")
    @Input()
    public sortable: boolean = false;

    @HostBinding("class.sorting")
    public isSorting: boolean = false;

    /**
     * Current column width
     */
    public width = null;

    public sortDirection = SortDirection.Asc;

    public id: string;

    @HostBinding("class.fixed-size")
    public get fixedSize() {
        return this.width !== null;
    }

    @HostBinding("style.flex-basis")
    public get flexBasis() {
        return this.width && `${this.width}px`;
    }

    constructor(@Inject(forwardRef(() => TableComponent)) private _table: TableComponent) {
        this.id = SecureUtils.uuid();
    }

    public ngOnChanges(changes) {
        if (changes.defaultWidth) {
            this.width = this.defaultWidth;
            this._table.head.updateDimensions();
        }
    }

    @HostListener("click")
    public onClick() {
        if (!this.sortable) {
            return;
        }

        if (this.isSorting) {
            this._invertOrder();
        }
        this._table.sort(this);
    }

    private _invertOrder() {
        if (this.sortDirection) {
            this.sortDirection = SortDirection.Asc;
        } else {
            this.sortDirection = SortDirection.Desc;
        }
    }
}
