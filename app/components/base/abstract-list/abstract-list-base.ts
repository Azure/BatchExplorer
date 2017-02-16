import {
    AfterViewInit, ContentChildren, EventEmitter, OnDestroy, Output, QueryList,
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { autobind } from "core-decorators";
import { BehaviorSubject, Subscription } from "rxjs";

import { FocusSectionComponent } from "../focus-section";
import { AbstractListItemBase } from "./abstract-list-item-base";

export interface ActivatedItemChangeEvent {
    key: string;
    initialValue?: boolean;
}

/**
 * Base class for a list component. Used by quicklist and table
 *
 * Usage:
 * 1. Extend class
 * 2. Refefine items with @ContentChildren and the class that inherit SelectableListItemBase
 */
export class AbstractListBase implements AfterViewInit, OnDestroy {
    @ContentChildren(AbstractListItemBase)
    public items: QueryList<AbstractListItemBase>;

    /**
     * When the list of selected item change.
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

    /**
     *  The active item is always in the selected list.
     */
    public get selectedItems() { return Object.keys(this._selectedItems); };

    public listFocused: boolean = false;
    public focusedItem: string = null;

    private _selectedItems: { [key: string]: boolean } = {};
    private _activeItemKey = new BehaviorSubject<ActivatedItemChangeEvent>(null);
    private _subs: Subscription[] = [];

    constructor(private router: Router, private focusSection: FocusSectionComponent) {
        this._activeItemKey.subscribe(x => {
            this.selectedItems = x ? [x.key] : [];
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

        router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
            if (this.items) {
                this.items.forEach((item) => {
                    item.checkActive();
                });
                const active = this.getActiveItem();
                this.setActiveItem(active && active.key);
            }
        });
    }

    public ngAfterViewInit() {
        this.items.changes.first().subscribe((newItems: QueryList<AbstractListItemBase>) => {
            setTimeout(() => {
                newItems.forEach((x) => x.checkActive());
                if (newItems.length && !this._activeItemKey.getValue()) {
                    this._setInitialActivatedItem();
                }
            });
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
        if (selected) {
            this._selectedItems[key] = true;
        } else {
            delete this._selectedItems[key];
        }
        this.selectedItemsChange.emit(this.selectedItems);
    }

    /**
     * Clear the selection by removing all selected items but the active one if applicable.
     */
    public clearSelection() {
        this._selectedItems = {};
        if (this._activeItemKey.value) {
            this._selectedItems[this._activeItemKey.value.key] = true;
        }

        this.items.forEach(item => item.selected = false);
        this.selectedItemsChange.emit(this.selectedItems);
    }

    /**
     * Get the item actually selected(With the routerlink)
     */
    public getActiveItem(): AbstractListItemBase {
        const vals = this.items.filter((x) => x.active);
        if (vals.length === 0) {
            return null;
        } else {
            return vals[0];
        }
    }

    /**
     * Set the current active item. It will also clear the selection if any
     * @param key Key of the initial item
     */
    public setActiveItem(key: string, initialValue = false) {
        const activeKey = this._activeItemKey;
        if (!(activeKey.value && activeKey.value.key === key)) {
            this._activeItemKey.next({ key, initialValue });
            this.items.forEach(x => x.active = x.key === key);
        }
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
        const items: AbstractListItemBase[] = this.items.toArray();
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
            // Need a timeout to trigger change detection in AfterViewInit otherwise angular throws an error
            setTimeout(() => {
                this._activeItemKey.next({ key: item.key, initialValue: true });
            });
        }
    }
}
