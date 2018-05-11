import {
    AfterContentInit, ChangeDetectorRef, Component, ContentChildren,
    EventEmitter, HostBinding, HostListener, Input, OnChanges, OnDestroy, Optional, Output, QueryList, ViewChild,
} from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { Router } from "@angular/router";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { FocusSectionComponent } from "@batch-flask/ui/focus-section";
import { DragUtils } from "@batch-flask/utils";
import { AbstractListBase, AbstractListBaseConfig, abstractListDefaultConfig } from "../abstract-list";
import { TableCellComponent } from "./table-cell";
import { TableColumnComponent } from "./table-column";
import { TableColumnManager } from "./table-column-manager";
import { TableHeadComponent } from "./table-head";

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
export class TableComponent extends AbstractListBase implements AfterContentInit, OnChanges, OnDestroy {
    @Input() public set config(config: TableConfig) {
        this._config = { ...tableDefaultConfig, ...config };
    }
    public get config() { return this._config; }

    @Output() public dropOnRow = new EventEmitter<DropEvent>();

    @Input() public data: List<any> | any[] = List([]);

    @ViewChild(TableHeadComponent) public head: TableHeadComponent;
    @ContentChildren(TableColumnComponent) public columnComponents: QueryList<TableColumnComponent>;
    @HostBinding("class.drag-hover") public isDraging = 0;
    @HostBinding("class.activable") public get activable() {
        return this.config.activable;
    }
    public dropTargetRowKey: string = null;

    public dimensions: Observable<number[]>;
    public columnManager = new TableColumnManager();

    protected _config: TableConfig = tableDefaultConfig;
    private _sortingColumn: TableColumnComponent;
    private _dimensions = new BehaviorSubject([]);

    /**
     * To enable keyboard navigation in the list it must be inside a focus section
     */
    constructor(
        contextmenuService: ContextMenuService,
        changeDetection: ChangeDetectorRef,
        router: Router,
        breadcrumbService: BreadcrumbService,
        @Optional() focusSection?: FocusSectionComponent) {
        super(contextmenuService, router, breadcrumbService, changeDetection, focusSection);
        this.dimensions = this._dimensions.asObservable();
    }

    public ngAfterContentInit() {
        this.columnManager.columns = this.columnComponents.map(x => x.getRef());
        this.columnComponents.changes.subscribe((columns) => {
            this.columnManager.columns = this.columnComponents.map(x => x.getRef());
            this.changeDetector.markForCheck();
        });
        // TODO-TIM compute dimensions
        // if (this.head) {
        //     this.head.dimensions.subscribe((dimensions) => this._dimensions.next(dimensions));
        // }
        this.changeDetector.markForCheck();
    }

    public ngOnChanges(changes) {
        if (changes.data) {
            if (!this.data) {
                this.displayItems = [];
            } else if (this.data instanceof List) {
                this.displayItems = (this.data as List<any>).toArray();
            } else if (Array.isArray(this.data)) {
                this.displayItems = this.data;
            } else {
                this.displayItems = [...this.data as any];
            }
        }
    }

    public ngOnDestroy() {
        this._dimensions.complete();
    }

    @HostListener("dragover", ["$event"])
    public handleDragHover(event: DragEvent) {
        DragUtils.allowDrop(event, this.config.droppable);
    }

    public updateColumns() {
        this.columnManager.columns = this.columnComponents.map(x => x.getRef());
        this.changeDetector.markForCheck();
    }

    public updateColumn(ref) {
        this.columnManager.updateColumn(ref);
        this.changeDetector.markForCheck();
    }

    public dragEnter(item, event: DragEvent) {
        event.stopPropagation();
        if (!this.config.droppable) { return; }
        this.isDraging++;
        this.dropTargetRowKey = item.id;
    }

    public dragLeave(item, event: DragEvent) {
        event.stopPropagation();

        if (!this.config.droppable) { return; }
        this.isDraging--;
        if (item.id === this.dropTargetRowKey && this.isDraging <= 0) {
            this.dropTargetRowKey = null;
        }
    }

    public handleDropOnRow(item, event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        if (!this.config.droppable) { return; }

        this.dropTargetRowKey = null;
        this.isDraging = 0;

        this.dropOnRow.emit({ key: item.id, data: event.dataTransfer });
    }

    public sort(column: TableColumnComponent) {
        if (this._sortingColumn) {
            this._sortingColumn.isSorting = false;
        }
        column.isSorting = true;
        this._sortingColumn = column;
        // this.displayItems = this.updateDisplayedItems();
    }

    public cellTrackByFn(index, cell: TableCellComponent) {
        return index;
    }

    protected updateDisplayedItems() {
        // const column = this._sortingColumn;
        // const rows = this.items.toArray();
        // if (!column) {
        //     this.displayItems = rows;
        //     return;
        // }
        // const index = this.head.getColumnIndex(column);
        // if (index === -1) {
        //     log.error("Error column is not in the table", column);
        //     return;
        // }
        // const sortedRows = rows.sort((a: TableRowComponent, b: TableRowComponent) => {
        //     const aValue = a.data[index];
        //     const bValue = b.data[index];
        //     if (aValue < bValue) {
        //         return -1;
        //     } else if (aValue > bValue) {
        //         return 1;
        //     }
        //     return 0;
        // });

        // const desc = column.sortDirection === SortDirection.Desc;
        // if (desc) {
        //     return sortedRows.reverse();
        // }
        // return sortedRows;
    }
}
