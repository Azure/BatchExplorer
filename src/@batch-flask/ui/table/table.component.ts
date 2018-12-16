import { LiveAnnouncer } from "@angular/cdk/a11y";
import {
    AfterContentInit, ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    Output,
    QueryList,
    ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { DragUtils } from "@batch-flask/utils";
import { AbstractListBase, AbstractListBaseConfig, abstractListDefaultConfig } from "../abstract-list";
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

    /**
     * If the table should allow column to be resized. Default true.
     */
    resizableColumn?: boolean;

    /**
     * If the table should hide the header. Default false.
     */
    hideHeader?: boolean;
}

export const tableDefaultConfig: Required<TableConfig> = {
    ...abstractListDefaultConfig,
    showCheckbox: false,
    droppable: false,
    resizableColumn: true,
    hideHeader: false,
};

export interface DropEvent {
    key: string;
    data: DataTransfer;
}

let idCounter = 0;

@Component({
    selector: "bl-table",
    templateUrl: "table.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent extends AbstractListBase implements AfterContentInit {
    @Input() public id = `bl-table-${idCounter++}`;

    @Input() public set config(config: TableConfig) {
        this._config = { ...tableDefaultConfig, ...config };
        this.dataPresenter.config = this._config.sorting;
    }
    public get config() { return this._config; }

    @Output() public dropOnRow = new EventEmitter<DropEvent>();

    @ViewChild(TableHeadComponent) public head: TableHeadComponent;
    @ContentChildren(TableColumnComponent) public columnComponents: QueryList<TableColumnComponent>;
    @HostBinding("class.drag-hover") public isDraging = 0;
    @HostBinding("class.activable") public get activable() {
        return this.config.activable;
    }

    // ----------------------------------------------------------------------
    // Aria
    // https://www.w3.org/TR/wai-aria-practices/examples/grid/dataGrids.html
    @HostBinding("attr.role") public readonly role = "grid";
    @HostBinding("attr.aria-readonly") public readonly ariaReadonly = true;
    @HostBinding("attr.aria-multiselectable") public readonly ariaMultiSelectable = true;
    @HostBinding("attr.aria-rowcount") public get ariaRowCount() {
        return this.items.length;
    }
    @HostBinding("attr.aria-colcount") public get ariaColCount() {
        return this.columnManager.columns.length;
    }

    public dropTargetRowKey: string | null = null;

    public columnManager: TableColumnManager;

    protected _config: Required<TableConfig> = tableDefaultConfig;

    /**
     * To enable keyboard navigation in the list it must be inside a focus section
     */
    constructor(
        contextmenuService: ContextMenuService,
        changeDetection: ChangeDetectorRef,
        router: Router,
        elementRef: ElementRef,
        liveAnnouncer: LiveAnnouncer,
        breadcrumbService: BreadcrumbService) {
        super(contextmenuService, router, breadcrumbService, elementRef, changeDetection);

        this.columnManager = new TableColumnManager(this.dataPresenter, liveAnnouncer);
    }

    public ngAfterContentInit() {
        this.columnManager.columns = this.columnComponents.map(x => x.getRef());
        this.columnComponents.changes.subscribe((columns) => {
            this.columnManager.columns = this.columnComponents.map(x => x.getRef());
            this.changeDetector.markForCheck();
        });

        this.changeDetector.markForCheck();
    }

    @HostListener("dragover", ["$event"])
    public handleDragHover(event: DragEvent) {
        DragUtils.allowDrop(event, this._config.droppable);
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

        this.dropOnRow.emit({ key: item.id, data: event.dataTransfer! });
    }
}
