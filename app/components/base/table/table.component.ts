import { Component, ContentChildren, Input, QueryList } from "@angular/core";
import { Router } from "@angular/router";

import { AbstractListBase } from "../abstract-list";
import { TableRowComponent } from "./table-row.component";

@Component({
    selector: "bex-table",
    templateUrl: "table.html",
})
export class TableComponent extends AbstractListBase {
    @ContentChildren(TableRowComponent)
    public items: QueryList<TableRowComponent>;

    constructor(router: Router) {
        super(router, null);
    }
}

@Component({
    selector: "bex-thead",
    template: `<tr><ng-content></ng-content></tr>`,
})
export class TableHeadComponent {
}

@Component({
    selector: "bex-column",
    template: `<ng-content></ng-content>`,
})
export class TableColumnComponent {
}

@Component({
    selector: "bex-cell",
    template: `
        <div *ngIf="value" class="cell-value" title="{{value}}">{{value}}</div>
        <ng-content *ngIf="!value"></ng-content>
    `,
})
export class TableCellComponent {
    @Input()
    public set value(value: string) {
        this._value = value;
    }
    public get value() {
        return this._value;
    }

    private _value: string;
}
