import {
    AfterViewInit, Component, ContentChildren, QueryList,
} from "@angular/core";

import { TableColumnComponent } from "./table-column.component";

@Component({
    selector: "bl-thead",
    template: `<tr><th style="width: 30px"></th><ng-content></ng-content></tr>`,
})
export class TableHeadComponent implements AfterViewInit {
    @ContentChildren(TableColumnComponent)
    public items: QueryList<TableColumnComponent>;

    private _columnIndexMap: StringMap<number>;

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
