import {
    ChangeDetectorRef, Component, ContentChild, ContentChildren, HostBinding, Input, Optional, QueryList,
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
    @HostBinding("class.drag-hover") public isDraging = 0;

    public dropTargetRowKey: string = null;

    protected _config: TableConfig = tableDefaultConfig;
    private _sortingColumn: TableColumnComponent;

    /**
     * To enable keyboard navigation in the list it must be inside a focus section
     */
    constructor(router: Router, changeDetection: ChangeDetectorRef, @Optional() focusSection?: FocusSectionComponent) {
        super(router, changeDetection, focusSection);
    }

    public dragEnter(item: TableRowComponent, event: DragEvent) {
        this.isDraging++;
        event.dataTransfer.effectAllowed = "copyMove";
        this.dropTargetRowKey = item.key;
    }

    public dragLeave(item: TableRowComponent, event: DragEvent) {
        this.isDraging--;
        event.dataTransfer.effectAllowed = "copy";
        if (item.key === this.dropTargetRowKey && this.isDraging <= 0) {
            this.dropTargetRowKey = null;
        }

    }

    public drop(item: TableRowComponent, event: DragEvent) {
        this.dropTargetRowKey = null;
        this.isDraging = 0;
        event.stopPropagation();
        event.preventDefault();
        console.log("Drop ", event.dataTransfer.files, event.dataTransfer.types);
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
