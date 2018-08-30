import {
    AfterContentInit, ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    Optional,
    Output,
    QueryList,
    ViewChild,
} from "@angular/core";
import { Subscription } from "rxjs";

import { Router } from "@angular/router";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { FocusSectionComponent } from "@batch-flask/ui/focus-section";
import { DragUtils } from "@batch-flask/utils";
import { AbstractListBase, AbstractListBaseConfig, abstractListDefaultConfig } from "../abstract-list";
import { TableColumnComponent } from "./table-column";
import { SortDirection, SortingInfo, TableColumnManager } from "./table-column-manager";
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
     * If the table should allow column to be resized. Default true.
     */
    resizableColumn?: boolean;

    /**
     * If the table should hide the header. Default false.
     */
    hideHeader?: boolean;
}

export const tableDefaultConfig = {
    ...abstractListDefaultConfig,
    showCheckbox: false,
    droppable: false,
    resizableColumn: true,
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
export class TableComponent extends AbstractListBase implements AfterContentInit, OnDestroy {
    @Input() public set config(config: TableConfig) {
        this._config = { ...tableDefaultConfig, ...config };
    }
    public get config() { return this._config; }

    @Output() public dropOnRow = new EventEmitter<DropEvent>();

    @ViewChild(TableHeadComponent) public head: TableHeadComponent;
    @ContentChildren(TableColumnComponent) public columnComponents: QueryList<TableColumnComponent>;
    @HostBinding("class.drag-hover") public isDraging = 0;
    @HostBinding("class.activable") public get activable() {
        return this.config.activable;
    }
    public dropTargetRowKey: string = null;

    public columnManager = new TableColumnManager();

    protected _config: TableConfig = tableDefaultConfig;
    private _sortingInfo: SortingInfo;
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
    }

    public ngAfterContentInit() {
        this.columnManager.columns = this.columnComponents.map(x => x.getRef());
        this.columnComponents.changes.subscribe((columns) => {
            this.columnManager.columns = this.columnComponents.map(x => x.getRef());
            this.changeDetector.markForCheck();
        });

        this._sub = this.columnManager.sorting.subscribe((sortingInfo) => {
            this._sortingInfo = sortingInfo;
        });
        this.changeDetector.markForCheck();
    }

    public ngOnDestroy() {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }

    @HostListener("dragover", ["$event"])
    public handleDragHover(event: DragEvent) {
        DragUtils.allowDrop(event, this.config.droppable);
    }

    public updateColumns() {
        this.columnManager.columns = this.columnComponents.map(x => x.getRef());
        this.changeDetector.markForCheck();
    }

    public updateColumn(name: string, ref) {
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
        // this.updateDisplayedItems();
        // TODO-TIM
    }
}
