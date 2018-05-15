import {
    ChangeDetectionStrategy, Component, HostBinding, HostListener, Inject, Input, forwardRef,
} from "@angular/core";
import { Router } from "@angular/router";

import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { TableColumnRef } from "../table-column-manager";
import { TableComponent, TableConfig } from "../table.component";

@Component({
    selector: "bl-row-render",
    templateUrl: "table-row-render.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableRowRenderComponent {
    @Input() public item: any;
    @Input() public columns: TableColumnRef[];
    @Input() public tableConfig: TableConfig;
    @Input() @HostBinding("class.focused") public focused: boolean;
    @Input() @HostBinding("class.selected") public selected: boolean;

    public dimensions: number[] = [];

    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: TableComponent,
        router: Router,
        breadcrumbService: BreadcrumbService) {
    }

    @HostListener("click", ["$event"])
    public handleClick(event: MouseEvent, activate = true) {
        this.table.handleClick(event, this.item, activate);
    }

    @HostListener("contextmenu")
    public openContextMenu() {
        this.table.openContextMenu(this);
    }

    public trackColumn(index: number, column: TableColumnRef) {
        return column.name;
    }
}
