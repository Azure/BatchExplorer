import {
    EventEmitter,
    ViewChild,
} from "@angular/core";
import { Observable } from "rxjs";

import { QuickListComponent } from "app/components/base/quick-list";

export class SelectableList {
    // NEED TO REDEFINE this in the child https://github.com/angular/angular/issues/5415
    @ViewChild(QuickListComponent)
    public set list(list: QuickListComponent | SelectableList) {
        this._list = list;
        if (list) {
            list.selectedItemsChange.subscribe((items) => {
                this.selectedItemsChange.emit(items);
                this.selectedItems = items;
            });

            list.activatedItemChange.subscribe((event) => {
                if (!(event.initialValue && this.activatedItem)) {
                    this.activatedItemChange.emit(event);
                    this.activatedItem = event.key;
                }
            });
        }
    }

    public get list() { return this._list; };

    public selectedItems: any[] = [];
    public activatedItem: string = null;
    public selectedItemsChange = new EventEmitter();
    public activatedItemChange = new EventEmitter<string>();

    private _list: QuickListComponent | SelectableList;

    public clearSelection() {
        if (this.list) {
            this.list.clearSelection();
        }
    }

    /**
     * @return if there is any item selected in that list(Not active)
     */
    public isAnyItemSelected(): boolean {
        return this.selectedItems.length > 0;
    }

    public refresh?(): Observable<any>;
    public deleteSelected?();
}
