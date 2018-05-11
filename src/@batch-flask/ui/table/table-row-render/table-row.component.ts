import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren,
    Inject, Input, OnChanges, OnDestroy, OnInit, QueryList, TemplateRef, ViewChild, forwardRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

import { AbstractListItemBase } from "@batch-flask/ui/abstract-list";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { TableCellComponent } from "../table-cell";
import { TableColumnComponent } from "../table-column";
import { TableComponent } from "../table.component";

@Component({
    selector: "bl-row-render",
    templateUrl: "table-row.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableRowRenderComponent extends AbstractListItemBase implements OnInit {
    @Input() public item: any;
    @Input() public columns: TableColumnComponent;

    public data: { [key: number]: any } = {};

    public get routerLinkActiveClass() {
        return this.link ? "selected" : null;
    }
    public dimensions: number[] = [];

    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: TableComponent,
        router: Router,
        private changeDetector: ChangeDetectorRef,
        breadcrumbService: BreadcrumbService) {
        super(table, router, breadcrumbService);
    }

    public trackCell(index: number, cell: TableCellComponent) {
        return index;
    }
}
