import {
    ChangeDetectorRef, Component, ContentChild, ContentChildren, Input, Optional, QueryList,
} from "@angular/core";
import { Router } from "@angular/router";

import { FocusSectionComponent } from "app/components/base/focus-section";
import { log } from "app/utils";
import { AbstractListBase, AbstractListBaseConfig, abstractListDefaultConfig } from "../abstract-list";
import { TableCellComponent } from "./table-cell.component";
import { SortDirection, TableColumnComponent } from "./table-column.component";
import { TableHeadComponent } from "./table-head.component";
import { TableRowComponent } from "./table-row.component";
import "./table.scss";

export interface TableConfig extends AbstractListBaseConfig {
    /**
     * If it should show the checkbox for selected rows
     * @default false
     */
    showCheckbox?: boolean;
}

export const tableDefaultConfig = {
    ...abstractListDefaultConfig,
    showCheckbox: false,
};
@Component({
    selector: "bl-table",
    templateUrl: "table.html",
})
export class TableComponent extends AbstractListBase {
    @Input() public set config(config: TableConfig) {
        this._config = { ...tableDefaultConfig, ...config };
    }
    public get config() { return this._config; }

    @ContentChild(TableHeadComponent) public head: TableHeadComponent;
    @ContentChildren(TableRowComponent) public items: QueryList<TableRowComponent>;

    protected _config: TableConfig = tableDefaultConfig;
    private _sortingColumn: TableColumnComponent;

    /**
     * To enable keyboard navigation in the list it must be inside a focus section
     */
    constructor(router: Router, changeDetection: ChangeDetectorRef, @Optional() focusSection?: FocusSectionComponent) {
        super(router, changeDetection, focusSection);
    }

    public sort(column: TableColumnComponent) {
        if (this._sortingColumn) {
            this._sortingColumn.isSorting = false;
        }
        column.isSorting = true;
        this._sortingColumn = column;
        this.displayItems = this.updateDisplayedItems();
    }

    public cellTrackByFn(index, cell: TableCellComponent) {
        return index;
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

        const desc = column.sortDirection === SortDirection.Desc;
        if (desc) {
            return sortedRows.reverse();
        }
        return sortedRows;
    }
}
