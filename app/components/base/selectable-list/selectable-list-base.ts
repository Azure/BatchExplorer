import {
    AfterViewInit, ContentChildren, EventEmitter, OnDestroy, Output, QueryList,
} from "@angular/core";
import { autobind } from "core-decorators";
import { BehaviorSubject, Subscription } from "rxjs";

import { FocusSectionComponent } from "../focus-section";
import { SelectableListItemBase } from "./selectable-list-item-base";

export interface ActivatedItemChangeEvent {
    key: string;
    initialValue?: boolean;
}
/**
 * Base class for a selectable list
 *
 * Usage:
 * 1. Extend class
 * 2. Refefine items with @ContentChildren and the class that inherit SelectableListItemBase
 */
export class SelectableListBase implements AfterViewInit, OnDestroy {
    @ContentChildren(SelectableListItemBase)
    public items: QueryList<SelectableListItemBase>;

    /**
     * When the list of selected item change
     */
    @Output()
    public selectedItemsChange = new EventEmitter<string[]>();

    /**
     * Event when the activated item(With the route) change. Send the item key.
     */
    @Output()
    public activatedItemChange = new EventEmitter<ActivatedItemChangeEvent>();

    public set selectedItems(items: string[]) {
        let map = {};
        items.forEach(x => map[x] = true);
        this._selectedItems = map;
        this.selectedItemsChange.emit(items);
    }
    public get selectedItems() { return Object.keys(this._selectedItems); };

    public listFocused: boolean = false;
    public focusedItem: string = null;

    private _selectedItems: { [key: string]: boolean } = {};
    private _activeItemKey = new BehaviorSubject<ActivatedItemChangeEvent>(null);
    private _subs: Subscription[] = [];

    constructor(private focusSection: FocusSectionComponent) {
        this._activeItemKey.subscribe(x => {
            this.activatedItemChange.emit(x);
            if (this.listFocused) {
                this.focusedItem = x.key;
            }
        });
        if (focusSection) {
            this._subs.push(focusSection.keypress.subscribe(this.keyPressed));
            this._subs.push(focusSection.onFocus.subscribe(this.onFocus));
            this._subs.push(focusSection.onBlur.subscribe(this.onBlur));
        }
    }

    public ngAfterViewInit() {
        let sub = this.items.changes.subscribe((newItems: QueryList<SelectableListItemBase>) => {
            if (newItems.length && !this._activeItemKey.getValue()) {
                this._setInitialActivatedItem();
            }
            sub.unsubscribe();
        });
        this._setInitialActivatedItem();
    }

    public ngOnDestroy() {
        this._subs.forEach((x) => x.unsubscribe());
    }

    public isSelected(key: string): boolean {
        return key in this._selectedItems;
    }

    public isActive(key: string): boolean {
        const event = this._activeItemKey.getValue();
        return Boolean(event && event.key === key);
    }

    /**
     * Toggle selection on the given item.
     * If there is one item selected it will also select the active item.
     * If you unselect the last item(Expect the active one) it wil
     * @param key Item unique key
     * @param selected If the item with the given key should be selected
     */
    public onSelectedChange(key: string, selected: boolean) {
        const activeItemKey = this._activeItemKey.value && this._activeItemKey.value.key;
        if (selected) {
            if (activeItemKey && Object.keys(this._selectedItems).length === 0) {
                this._selectedItems[activeItemKey] = true;
            }
            this._selectedItems[key] = true;
        } else {
            delete this._selectedItems[key];
            if (activeItemKey && Object.keys(this._selectedItems).length === 1 && this._selectedItems[activeItemKey]) {
                delete this._selectedItems[activeItemKey];
            }
        }
        this.selectedItemsChange.emit(this.selectedItems);
    }

    public clearSelection() {
        this._selectedItems = {};
        this.items.forEach(item => item.selected = false);
        this.selectedItemsChange.emit(this.selectedItems);
    }

    /**
     * Get the item actually selected(With the routerlink)
     */
    public getActiveItem(): SelectableListItemBase {
        const vals = this.items.filter((x) => x.active);
        if (vals.length === 0) {
            return null;
        } else {
            return vals[0];
        }
    }

    public setActiveItem(key: string, initialValue = false) {
        this._activeItemKey.next({ key, initialValue });
        this.items.forEach(x => x.active = x.key === key);
        this.clearSelection();
    }

    /**
     * Select items from the active item to the selected one.
     */
    public selectTo(key: string) {
        let foundStart = false;
        this.items.some((item) => {
            if (!foundStart && (item.active || item.key === key)) {
                foundStart = true;
                this._selectedItems[item.key] = true;
                item.selected = true;
            } else if (foundStart) {
                this._selectedItems[item.key] = true;
                item.selected = true;
                // Reached the end of the selection
                if (item.active || item.key === key) {
                    return true;
                }
            }
        });
        this.selectedItemsChange.emit(this.selectedItems);
    }

    @autobind()
    public onFocus(event: FocusEvent) {
        this.listFocused = true;
        const active = this._activeItemKey.getValue();
        this.focusedItem = active && active.key;
    }

    @autobind()
    public onBlur(event) {
        this.listFocused = false;
        this.focusedItem = null;
    }

    @autobind()
    public keyPressed(event: KeyboardEvent) {
        const items: SelectableListItemBase[] = this.items.toArray();
        let index = 0;
        let currentItem;
        for (let item of items) {
            if (item.key === this.focusedItem) {
                currentItem = item;
                break;
            }
            index++;
        }
        switch (event.code) {
            case "ArrowDown":
                index++;
                event.preventDefault();
                break;
            case "ArrowUp":
                index--;
                event.preventDefault();
                break;
            case "Space":
                currentItem.activateItem();
                event.preventDefault();
                return;
            default:
        }
        index = (index + this.items.length) % this.items.length;
        const item = items[index];
        this.focusedItem = item.key;
    }

    private _setInitialActivatedItem() {
        const item = this.getActiveItem();
        if (item) {
            this._activeItemKey.next({ key: item.key, initialValue: true });
        }
    }
}
