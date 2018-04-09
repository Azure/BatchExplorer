import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren,
    Inject, OnDestroy, OnInit, QueryList, TemplateRef, ViewChild, forwardRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

import { AbstractListItemBase } from "@batch-flask/ui/abstract-list";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { TableCellComponent } from "../table-cell";
import { TableComponent } from "../table.component";

@Component({
    selector: "bl-row",
    templateUrl: "table-row.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableRowComponent extends AbstractListItemBase implements AfterContentInit, OnInit, OnDestroy {
    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

    @ContentChildren(TableCellComponent)
    public cells: QueryList<TableCellComponent>;

    public data: { [key: number]: any } = {};

    public get routerLinkActiveClass() {
        return this.link ? "selected" : null;
    }
    public dimensions: number[] = [];
    private _sub: Subscription;

    // tslint:disable:no-forward-ref
    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: TableComponent,
        router: Router,
        private changeDetector: ChangeDetectorRef,
        contextmenuService: ContextMenuService,
        breadcrumbService: BreadcrumbService) {
        super(table, router, contextmenuService, breadcrumbService);

        this._sub = this.table.dimensions.subscribe((dimensions) => {
            this.dimensions = dimensions;
            this.changeDetector.markForCheck();
        });
    }

    public ngAfterContentInit() {
        this.cells.changes.subscribe(() => {
            this._updateData();
            this.changeDetector.markForCheck();
        });
        this._updateData();
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public trackCell(index: number, cell: TableCellComponent) {
        return index;
    }

    private _updateData() {
        const map = {};
        this.cells.forEach((cell, index) => {
            map[index] = cell.value;
        });
        this.data = map;
    }
}
