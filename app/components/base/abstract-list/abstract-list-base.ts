import {
    AfterViewInit, ChangeDetectorRef, ContentChildren, EventEmitter, Input, OnDestroy, Output, QueryList,
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { autobind } from "app/core";
import { BehaviorSubject, Subscription } from "rxjs";

import { FocusSectionComponent } from "../focus-section";
import { AbstractListItemBase } from "./abstract-list-item-base";

export interface ActivatedItemChangeEvent {
    key: string;
    initialValue?: boolean;
}

export interface AbstractListBaseConfig {
    /**
     * If it should allow the user to activate an item(And the routerlink if applicable)
     * @default true
     */
    activable?: boolean;

}

export const abstractListDefaultConfig: AbstractListBaseConfig = {
    activable: true,
};

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
     * List of items to display(Which might be different from the full items list because of sorting and other)
     */
    public displayItems: AbstractListItemBase[] = [];

    @Input() public set config(config: AbstractListBaseConfig) {
        this._config = { ...abstractListDefaultConfig, ...config };
    }
    public get config() { return this._config; }

    @Input()
    public set activeItem(key) {
        this._activeItemInput = key;
        this.setActiveItem(key);
    }

    /**
     * When the list of selected item change.
     */
    @Output()
    public selectedItemsChange = new EventEmitter<string[]>();

    @Output()
    public activeItemChange = new EventEmitter<string>();

    @Input() public set selectedItems(items: string[]) {
        const map = {};
        items.forEach(x => map[x] = true);
        this._selectedItems = map;
        this.selectedItemsChange.emit(items);
    }

    /**
     *  The active item is always in the selected list.
     */
    public get selectedItems() { return Object.keys(this._selectedItems); }

    public listFocused: boolean = false;
    public focusedItem = new BehaviorSubject<string>(null);

    protected _config: AbstractListBaseConfig = abstractListDefaultConfig;
    /**
     * Map of the selected items. Used for better performance to check if an item is selected.
     */
    private _selectedItems: { [key: string]: boolean } = {};
    private _activeItemKey = new BehaviorSubject<ActivatedItemChangeEvent>(null);

    /**
     * Save the value provided in the activeItem input
     */
    private _activeItemInput = null;
    private _subs: Subscription[] = [];

    constructor(
        private changeDetection: ChangeDetectorRef,
        focusSection: FocusSectionComponent) {

        this._subs.push(this._activeItemKey.subscribe(x => {
            this.selectedItems = x ? [x.key] : [];

            if (!x || x.key !== this._activeItemInput) {
                this.activeItemChange.emit(x && x.key);
            }

            if (this.listFocused) {
                this.focusedItem.next(x && x.key);
            }
        }));

        if (focusSection) {
            this._subs.push(focusSection.keypress.subscribe(this.keyPressed));
            this._subs.push(focusSection.onFocus.subscribe(this.onFocus));
            this._subs.push(focusSection.onBlur.subscribe(this.onBlur));
        }
    }

    public ngAfterViewInit() {
        if (this.items.length > 0) {
            this._processInitialItems(this.items);
        } else {
            this.items.changes.take(1).subscribe((newItems: QueryList<AbstractListItemBase>) => {
                this._processInitialItems(newItems);
            });
        }

        this._subs.push(this.items.changes.subscribe(() => {
            setTimeout(() => {
                const active = this.getActiveItemFromRouter();
                this.setActiveItem(active && active.key);
            });
            this._updateDisplayItems();
        }));
        this._updateDisplayItems();
        this.changeDetection.detectChanges();

    }

    public ngOnDestroy() {
        this._subs.forEach((x) => x.unsubscribe());
    }

    /**
     * Test if the given key is in the list of selected items.
     */
    public isSelected(key: string): boolean {
        return key in this._selectedItems;
    }

    /**
     * Test to check if the given key is the active item.
     */
    public isActive(key: string): boolean {
        return this.config.activable && Boolean(this.activeKey === key);
    }

    /**
     * @returns the current key
     */
    public get activeKey(): string {
        const event = this._activeItemKey.value;
        return event && event.key;
    }

    /**
     * Toggle selection of given
     * @param key Key of the item to toggle
     * @param event Optional event to prevent propagation
     */
    public toggleSelected(key: string, event?: Event) {
        if (event) {
            event.stopPropagation();
        }
        this.onSelectedChange(key, !this._selectedItems[key]);
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
        this._updateSelectedItems();
    }

    /**
     * Clear the selection by removing all selected items but the active one if applicable.
     */
    public clearSelection() {
        this._selectedItems = {};
        if (this._activeItemKey.value) {
            this._selectedItems[this._activeItemKey.value.key] = true;
        }

        this._updateSelectedItems();
    }

    /**
     * Get the item actually selected(With the routerlink)
     */
    public getActiveItemFromRouter(): AbstractListItemBase {
        const vals = this.items.filter((x) => this._checkItemActive(x));
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
        if (!this.config.activable) {
            return;
        }
        const activeKey = this._activeItemKey;
        const sameKey = activeKey.value && activeKey.value.key === key;
        if (!sameKey) {
            this._activeItemKey.next({ key, initialValue });
        }
        this.clearSelection();
    }

    /**
     * Select items from the active item to the selected one.
     */
    public selectTo(key: string) {
        let foundStart = false;
        const activeKey = this.activeKey;
        this.displayItems.some((item) => {
            if (!foundStart && (item.key === activeKey || item.key === key)) {
                foundStart = true;
                this._selectedItems[item.key] = true;
            } else if (foundStart) {
                this._selectedItems[item.key] = true;
                // Reached the end of the selection
                if (item.key === activeKey || item.key === key) {
                    return true;
                }
            }
        });
        this._updateSelectedItems();
    }

    @autobind()
    public onFocus(event: FocusEvent) {
        this.listFocused = true;
        const active = this._activeItemKey.value;
        if (!this.focusedItem.value) {
            this.focusedItem.next(active && active.key);
            this.changeDetection.markForCheck();
        }
    }

    @autobind()
    public onBlur(event) {
        this.listFocused = false;
        this.focusedItem.next(null);
        this.changeDetection.markForCheck();
    }

    public setFocusedItem(key: string) {
        this.focusedItem.next(key);
    }

    @autobind()
    public keyPressed(event: KeyboardEvent) {
        const items: AbstractListItemBase[] = this.displayItems;
        let index = 0;
        let currentItem;
        for (const item of items) {
            if (item.key === this.focusedItem.value) {
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
        index = (index + items.length) % items.length;
        const newItem = items[index];
        this.focusedItem.next(newItem.key);
    }

    public trackByFn(index, item) {
        return item.key;
    }

    /**
     * Implement this to apply some sorting or other logic
     */
    protected computeDisplayedItems?(): AbstractListItemBase[];

    private _setInitialActivatedItem() {
        const item = this.getActiveItemFromRouter();

        if (item) {
            this.setActiveItem(item.key, true);
            this._updateSelectedItems();
        }
    }

    /**
     * Goes through the initial list of items to check if one is active.
     */
    private _processInitialItems(items: QueryList<AbstractListItemBase>) {
        setTimeout(() => {
            if (items.length && !this._activeItemKey.value) {
                this._setInitialActivatedItem();
            }
        });
    }

    private _checkItemActive(item: AbstractListItemBase): boolean {
        return this.isActive(item.key);
    }

    private _updateDisplayItems() {
        if (this.computeDisplayedItems) {
            this.displayItems = this.computeDisplayedItems();
        } else {
            this.displayItems = this.items.toArray();
        }
        this._updateSelectedItems();
    }

    /**
     * Update the items to mark which ones are selected
     */
    private _updateSelectedItems() {
        this.displayItems.forEach((item) => {
            item.selected = Boolean(this._selectedItems[item.key]);
        });
        this.selectedItemsChange.emit(this.selectedItems);
        this.changeDetection.markForCheck();
    }
}
