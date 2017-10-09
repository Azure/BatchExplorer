import { OnDestroy, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";

import { TableComponent } from "app/components/base/table";
import { SelectableList } from "./selectable-list";

export class ListOrTableBase extends SelectableList implements OnDestroy {
    @ViewChild(TableComponent)
    public set table(table: TableComponent) {
        if (table && this._table !== table) {
            this._table = table;
            this._clearTableSubs();
            this._tableSubs.push(table.selectedItemsChange.subscribe((items) => {
                this.selectedItemsChange.emit(items);
                this.selectedItems = items;
            }));

            this._tableSubs.push(table.activatedItemChange.subscribe((event) => {
                if (!(event.initialValue && this.activatedItem)) {
                    this.activatedItemChange.emit(event);
                    this.activatedItem = event.key;
                }
            }));
        }
    }
    public get table() { return this._table; }

    private _table: TableComponent;
    private _tableSubs: Subscription[] = [];

    public ngOnDestroy() {
        this._clearTableSubs();
        super.ngOnDestroy();
    }

    private _clearTableSubs() {
        this._tableSubs.forEach(x => x.unsubscribe());
        this._tableSubs = [];
    }
}
