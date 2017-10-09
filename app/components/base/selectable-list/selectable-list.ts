import { EventEmitter, OnDestroy, ViewChild } from "@angular/core";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { autobind } from "core-decorators";
import { Observable, Subscription } from "rxjs";

import { DeleteSelectedItemsDialogComponent } from "app/components/base/list-and-show-layout";
import { QuickListComponent } from "app/components/base/quick-list";
import { log } from "app/utils";

export class SelectableList implements OnDestroy {
    // NEED TO REDEFINE this in the child https://github.com/angular/angular/issues/5415
    @ViewChild(QuickListComponent)
    public set list(list: QuickListComponent | SelectableList) {
        this._list = list;
        this._clearListSubs();
        if (list && this._list !== list) {
            console.log("THis change??");
            this._listSubs.push(list.selectedItemsChange.subscribe((items) => {
                this.selectedItemsChange.emit(items);
                this.selectedItems = items;
            }));

            this._listSubs.push(list.activatedItemChange.subscribe((event) => {
                if (!(event.initialValue && this.activatedItem)) {
                    this.activatedItemChange.emit(event);
                    this.activatedItem = event.key;
                }
            }));
        }
    }

    public get list() { return this._list; }

    /**
     * Name of the thing we are deleting
     */
    public entityName: string;

    /**
     * Parent id of the thing we are deleting, if at all.
     * Uses this value to make the delete message easier to understand.
     */
    public entityParentId: string;

    public selectedItems: any[] = [];
    public activatedItem: string = null;
    public selectedItemsChange = new EventEmitter();
    public activatedItemChange = new EventEmitter<string>();

    private _list: QuickListComponent | SelectableList;
    private _listSubs: Subscription[] = [];

    constructor(protected dialog?: MdDialog) {
    }

    public ngOnDestroy() {
        this._clearListSubs();
    }

    /**
     * @return if there is any item selected in that list(Not active)
     */
    public isAnyItemSelected(): boolean {
        return this.selectedItems.length > 0;
    }

    public refresh?(): Observable<any>;
    public deleteSelected?();
    public clearSelection?() {
        if (this.list) {
            this.list.clearSelection();
        }
    }

    @autobind()
    public deleteSelectedItems() {
        if (!this.dialog) {
            log.error("this.dialog not defined, call 'super(dialog)' in your constructor to set it.");
            return;
        }

        let config = new MdDialogConfig();
        const dialogRef = this.dialog.open(DeleteSelectedItemsDialogComponent, config);
        dialogRef.componentInstance.items = this.selectedItems;
        dialogRef.componentInstance.entityName = this.entityName;
        dialogRef.componentInstance.parentId = this.entityParentId;
        dialogRef.afterClosed().subscribe((proceed) => {
            if (proceed) {
                this.deleteSelected();
                this.clearSelection();
            }
        });
    }

    private _clearListSubs() {
        this._listSubs.forEach(x => x.unsubscribe());
    }
}
