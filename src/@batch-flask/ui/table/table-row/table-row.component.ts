import {
    AfterViewInit, ChangeDetectionStrategy, Component, ContentChildren, Inject, OnInit,
    QueryList, TemplateRef, ViewChild, forwardRef,
} from "@angular/core";
import { Router } from "@angular/router";

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
export class TableRowComponent extends AbstractListItemBase implements AfterViewInit, OnInit {
    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

    @ContentChildren(TableCellComponent)
    public cells: QueryList<TableCellComponent>;

    public data: { [key: number]: any } = {};
    public get routerLinkActiveClass() {
        return this.link ? "selected" : null;
    }

    // tslint:disable:no-forward-ref
    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: TableComponent,
        router: Router,
        contextmenuService: ContextMenuService,
        breadcrumbService: BreadcrumbService) {
        super(table, router, contextmenuService, breadcrumbService);
    }

    public ngAfterViewInit() {
        this.cells.changes.subscribe(() => {
            this._updateData();
        });
        this._updateData();
    }

    private _updateData() {
        const map = {};
        this.cells.forEach((cell, index) => {
            map[index] = cell.value;
        });
        this.data = map;
    }
}
