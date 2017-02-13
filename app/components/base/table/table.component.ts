import { Component, ContentChildren, Input, QueryList } from "@angular/core";

import { SelectableListBase } from "../selectable-list/selectable-list-base";
import { TableRowComponent } from "./table-row.component";

@Component({
    selector: "bex-table",
    templateUrl: "table.html",
})
export class TableComponent extends SelectableListBase {
    @ContentChildren(TableRowComponent)
    public items: QueryList<TableRowComponent>;

    constructor() {
        super(null);
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
