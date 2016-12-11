import { Component, ContentChildren, EventEmitter, Input, Output, QueryList } from "@angular/core";

import { ActivatedItemChangeEvent, SelectableListBase } from "../selectable-list/selectable-list-base";
import { TableRowComponent } from "./table-row.component";

@Component({
    selector: "bex-table",
    templateUrl: "table.html",
})
export class TableComponent extends SelectableListBase {
    @ContentChildren(TableRowComponent)
    public items: QueryList<TableRowComponent>;
}

@Component({
    selector: "bex-thead",
    templateUrl: `<tr><ng-content></ng-content></tr>`,
})
export class TableHeadComponent {
}

@Component({
    selector: "bex-column",
    templateUrl: `<ng-content></ng-content>`,
})
export class TableColumnComponent {
}

@Component({
    selector: "bex-cell",
    templateUrl: `<ng-content></ng-content>`,
})
export class TableCellComponent {
}
