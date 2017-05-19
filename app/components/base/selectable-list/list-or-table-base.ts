import { ViewChild } from "@angular/core";

import { TableComponent } from "app/components/base/table";
import { SelectableList } from "./selectable-list";

export class ListOrTableBase extends SelectableList {
    @ViewChild(TableComponent)
    public set table(table: TableComponent) {
        this._table = table;
        if (table) {
            table.selectedItemsChange.subscribe((items) => {
                this.selectedItemsChange.emit(items);
                this.selectedItems = items;
            });

            table.activatedItemChange.subscribe((event) => {
                if (!(event.initialValue && this.activatedItem)) {
                    this.activatedItemChange.emit(event);
                    this.activatedItem = event.key;
                }
            });
        }
    }
    public get table() { return this._table; }

    private _table: TableComponent;
}
