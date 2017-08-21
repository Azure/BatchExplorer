import {
    AfterViewInit, Component, ContentChildren, Inject, QueryList, forwardRef,
} from "@angular/core";

import { TableColumnComponent } from "./table-column.component";
import { TableComponent } from "./table.component";

@Component({
    selector: "bl-thead",
    templateUrl: "table-head.html",
})
export class TableHeadComponent implements AfterViewInit {
    @ContentChildren(TableColumnComponent)
    public items: QueryList<TableColumnComponent>;

    private _columnIndexMap: StringMap<number>;

    // tslint:disable-next-line:no-forward-ref
    constructor( @Inject(forwardRef(() => TableComponent)) public table: TableComponent) { }
    public ngAfterViewInit() {
        this.items.changes.subscribe(() => {
            this._updateColumnIndexMap();
        });
        this._updateColumnIndexMap();
    }

    public getColumnIndex(column: TableColumnComponent) {
        if (!(column.id in this._columnIndexMap)) {
            return -1;
        }
        return this._columnIndexMap[column.id];
    }

    private _updateColumnIndexMap() {
        const map = {};
        this.items.forEach((column, index) => {
            map[column.id] = index;
        });
        this._columnIndexMap = map;
    }
}
