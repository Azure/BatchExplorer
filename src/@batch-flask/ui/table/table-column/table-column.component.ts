import {
    ChangeDetectionStrategy, Component, HostBinding, HostListener, Inject, Input, forwardRef,
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
export class TableColumnComponent {
    public SortDirection = SortDirection;

    @HostBinding("class.sortable")
    @Input()
    public sortable: boolean = false;

    @HostBinding("class.sorting")
    public isSorting: boolean = false;

    public sortDirection = SortDirection.Asc;

    public id: string;

    // tslint:disable-next-line:no-forward-ref
    constructor( @Inject(forwardRef(() => TableComponent)) private _table: TableComponent) {
        this.id = SecureUtils.uuid();
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
