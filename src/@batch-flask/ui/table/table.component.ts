import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
    ContentChildren, EventEmitter, HostBinding, HostListener, Input,
    OnChanges, OnDestroy, Optional, Output, QueryList, ViewChild,
} from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import { Router } from "@angular/router";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { FocusSectionComponent } from "@batch-flask/ui/focus-section";
import { DragUtils, log } from "@batch-flask/utils";
import { AbstractListBase, AbstractListBaseConfig, abstractListDefaultConfig } from "../abstract-list";
import { TableColumnComponent } from "./table-column";
import { SortDirection, SortingInfo, TableColumnManager, TableColumnRef } from "./table-column-manager";
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

    /**
     * If the column name don't map to a value of the object
     * this allows you to return the path this column should map to.
     * This is used for sorting.
     */
    values?: StringMap<(item: any) => any>;
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
    changeDetection: ChangeDetectionStrategy.OnPush,
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
    private _sortingInfo: SortingInfo;
    private _dimensions = new BehaviorSubject([]);
    private _sub: Subscription;

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
        this._sub = this.columnManager.sorting.subscribe((sortingInfo) => {
            this._sortingInfo = sortingInfo;
        });
        this.changeDetector.markForCheck();
    }

    public ngOnChanges(changes) {
        if (changes.data) {
            this.updateDisplayedItems();
        }
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
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

    /**
     * Sort the table by the column name
     * @param column
     */
    public sort(column: string, direction: SortDirection = SortDirection.Asc) {
        this.columnManager.sortBy(column, direction);
        this.updateDisplayedItems();
    }

    protected updateDisplayedItems() {
        this.displayItems = this.computeDisplayedItems();
        this.changeDetector.markForCheck();
    }

    protected computeDisplayedItems() {
        const sortingInfo = this._sortingInfo;
        const items = this._getItems();
        if (!sortingInfo) {
            return items;
        }
        const column = this.columnManager.columnMap.get(sortingInfo.column);
        if (!column) {
            const keys = [...this.columnManager.columnMap.keys()];
            log.error(`Cannot sort. There is no column with name ${column.name} in the list of columns ${keys}`);
            return items;
        }
        return this._sortItems(items, column, sortingInfo.direction);
    }

    private _getItems() {
        if (!this.data) {
            return [];
        } else if (this.data instanceof List) {
            return (this.data as List<any>).toArray();
        } else if (Array.isArray(this.data)) {
            return this.data;
        } else {
            return [...this.data as any];
        }
    }

    private _sortItems(items: any[], column: TableColumnRef, direction: SortDirection): any[] {
        const getColumnValue = this._columnValueFn(column);

        const sortedRows = [...items].sort((a, b) => {
            const aValue = getColumnValue(a);
            const bValue = getColumnValue(b);
            if (aValue < bValue) {
                return -1;
            } else if (aValue > bValue) {
                return 1;
            }
            return 0;
        });

        const desc = direction === SortDirection.Desc;
        if (desc) {
            return sortedRows.reverse();
        }
        return sortedRows;
    }

    private _columnValueFn(column: TableColumnRef) {
        if (this.config.values && column.name in this.config.values) {
            return this.config.values[column.name];
        } else {
            return (item) => item[column.name];
        }
    }
}
