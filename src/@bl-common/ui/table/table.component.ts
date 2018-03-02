import {
    ChangeDetectorRef, Component, ContentChild, ContentChildren, EventEmitter,
    HostBinding, HostListener, Input, Optional, Output, QueryList,
} from "@angular/core";

import { FocusSectionComponent } from "@bl-common/ui/focus-section";
import { DragUtils } from "@bl-common/utils";
import { log } from "app/utils";
import { AbstractListBase, AbstractListBaseConfig, abstractListDefaultConfig } from "../abstract-list";
import { TableCellComponent } from "./table-cell";
import { SortDirection, TableColumnComponent } from "./table-column";
import { TableHeadComponent } from "./table-head";
import { TableRowComponent } from "./table-row";
import "./table.scss";

export interface TableConfig extends AbstractListBaseConfig {
    /**
     * If it should show the checkbox for selected rows
     * @default false
     */
    showCheckbox?: boolean;

    /**
     * If we should allow to drop on the table
     * @default false
     */
    droppable?: boolean;
}

export const tableDefaultConfig = {
    ...abstractListDefaultConfig,
    showCheckbox: false,
    droppable: false,
};

export interface DropEvent {
    key: string;
    data: DataTransfer;
}

@Component({
    selector: "bl-table",
    templateUrl: "table.html",
})
export class TableComponent extends AbstractListBase {
    @Input() public set config(config: TableConfig) {
        this._config = { ...tableDefaultConfig, ...config };
    }
    public get config() { return this._config; }

    @Output() public dropOnRow = new EventEmitter<DropEvent>();

    @ContentChild(TableHeadComponent) public head: TableHeadComponent;
    @ContentChildren(TableRowComponent) public items: QueryList<TableRowComponent>;
    @HostBinding("class.drag-hover") public isDraging = 0;
    @HostBinding("class.activable") public get activable() {
        return this.config.activable;
    }
    public dropTargetRowKey: string = null;

    protected _config: TableConfig = tableDefaultConfig;
    private _sortingColumn: TableColumnComponent;

    /**
     * To enable keyboard navigation in the list it must be inside a focus section
     */
    constructor(changeDetection: ChangeDetectorRef, @Optional() focusSection?: FocusSectionComponent) {
        super(changeDetection, focusSection);
    }

    @HostListener("dragover", ["$event"])
    public handleDragHover(event: DragEvent) {
        DragUtils.allowDrop(event, this.config.droppable);
    }

    public dragEnter(item: TableRowComponent, event: DragEvent) {
        event.stopPropagation();
        if (!this.config.droppable) { return; }
        this.isDraging++;
        this.dropTargetRowKey = item.key;
    }

    public dragLeave(item: TableRowComponent, event: DragEvent) {
        event.stopPropagation();

        if (!this.config.droppable) { return; }
        this.isDraging--;
        if (item.key === this.dropTargetRowKey && this.isDraging <= 0) {
            this.dropTargetRowKey = null;
        }
    }

    public handleDropOnRow(item: TableRowComponent, event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        if (!this.config.droppable) { return; }

        this.dropTargetRowKey = null;
        this.isDraging = 0;

        this.dropOnRow.emit({ key: item.key, data: event.dataTransfer });
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
