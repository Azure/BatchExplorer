import {
    ChangeDetectionStrategy, Component, HostBinding, HostListener, Inject, Input, OnInit, forwardRef,
} from "@angular/core";
import { Router } from "@angular/router";

import { AbstractListItemBase } from "@batch-flask/ui/abstract-list";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { TableColumnRef } from "../table-column-manager";
import { TableComponent } from "../table.component";

@Component({
    selector: "bl-row-render",
    templateUrl: "table-row.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line:use-host-property-decorator
    host: {
        "(contextmenu)": "openContextMenu($event)",
        "[class.drop-target]": "key === dropTargetRowKey",
        "(dragenter)": "list.dragEnter(item, $event)",
        "(dragleave)": "list.dragLeave(item, $event)",
        "(drop)": "list.handleDropOnRow(item, $event)",
    },
})
export class TableRowRenderComponent extends AbstractListItemBase implements OnInit {
    @Input() public item: any;
    @Input() public columns: TableColumnRef[];
    @Input() @HostBinding("class.focused") public focused: boolean;
    @Input() @HostBinding("class.selected") public selected: boolean;

    public dimensions: number[] = [];

    constructor(
        @Inject(forwardRef(() => TableComponent)) public table: TableComponent,
        router: Router,
        // private changeDetector: ChangeDetectorRef,
        breadcrumbService: BreadcrumbService) {
        super(table, router, breadcrumbService);
    }

    @HostListener("click", ["$event"])
    public handleClick(event: MouseEvent, activate = true) {
        super.handleClick(event, activate);
    }

    public trackColumn(index: number, column: TableColumnRef) {
        return column.name;
    }
}
