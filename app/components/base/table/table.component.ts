import { AfterViewInit, Component, ContentChild, ContentChildren, Input, QueryList } from "@angular/core";
import { Router } from "@angular/router";

import { FocusSectionComponent } from "app/components/base/focus-section";
import { log } from "app/utils";
import { AbstractListBase } from "../abstract-list";
import { TableColumnComponent } from "./table-column.component";
import { TableRowComponent } from "./table-row.component";

@Component({
    selector: "bl-thead",
    template: `<tr><ng-content></ng-content></tr>`,
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
        console.log("Update index map", map);
        this._columnIndexMap = map;
    }
}

@Component({
    selector: "bl-table",
    templateUrl: "table.html",
})
export class TableComponent extends AbstractListBase {
    @ContentChild(TableHeadComponent)
    public head: TableHeadComponent;

    @ContentChildren(TableRowComponent)
    public items: QueryList<TableRowComponent>;

    private _sortingColumn: TableColumnComponent;

    constructor(router: Router, focusSection: FocusSectionComponent) {
        super(router, focusSection);
    }

    public sort(column: TableColumnComponent) {
        this._sortingColumn = column;
        this.displayItems = this.updateDisplayedItems();
    }

    protected updateDisplayedItems() {
        const column = this._sortingColumn;
        const rows = this.items.toArray();
        if (!column) {
            this.displayItems = rows;
            return;
        }
        const index = this.head.getColumnIndex(column);
        if (index === -1) {
            log.error("Error column is not in the table", column);
            return;
        }
        const sortedRows = rows.sort((a: TableRowComponent, b: TableRowComponent) => {
            const aValue = a.data[index];
            const bValue = b.data[index];
            if (aValue < bValue) {
                return -1;
            } else if (aValue > bValue) {
                return 1;
            }
            return 0;
        });
        return sortedRows;
    }
}
