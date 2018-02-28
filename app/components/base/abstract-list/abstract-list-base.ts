import {
    AfterViewInit, ChangeDetectorRef, ContentChildren, Input, OnDestroy, QueryList,
} from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";

import { autobind } from "app/core";
import { ListSelection, SelectableList } from "app/core/list";
import { FocusSectionComponent } from "../focus-section";
import { AbstractListItemBase } from "./abstract-list-item-base";

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
 * Base class for quick-list and table component
 *
 * Usage:
 * 1. Extend class
 * 2. Refefine items with @ContentChildren and the class that inherit SelectableListItemBase
 */
export class AbstractListBase extends SelectableList implements AfterViewInit, OnDestroy {
    @ContentChildren(AbstractListItemBase)
    public items: QueryList<AbstractListItemBase>;

    /**
     * List of items to display(Which might be different from the full items list because of sorting and other)
     */
    public displayItems: AbstractListItemBase[] = [];

    /**
     * List of items that are currently being displayed with the virtual scroll
     */
    public viewPortItems: AbstractListItemBase[] = [];

    @Input() public set config(config: AbstractListBaseConfig) {
        this._config = { ...abstractListDefaultConfig, ...config };
    }
    public get config() { return this._config; }

    public set selection(selection: ListSelection) {
        super.selection = selection;
        this._updateSelectedItems();
    }
    public get selection() { return super.selection; }

    public listFocused: boolean = false;
    public focusedItem = new BehaviorSubject<string>(null);
    public showScrollShadow: boolean;

    protected _config: AbstractListBaseConfig = abstractListDefaultConfig;

    private _subs: Subscription[] = [];

    constructor(
        changeDetection: ChangeDetectorRef,
        focusSection: FocusSectionComponent) {
        super(changeDetection);

        if (focusSection) {
            this._subs.push(focusSection.keypress.subscribe(this.keyPressed));
            this._subs.push(focusSection.onFocus.subscribe(this.onFocus));
            this._subs.push(focusSection.onBlur.subscribe(this.onBlur));
        }
    }

    public ngAfterViewInit() {
        this._subs.push(this.items.changes.subscribe(() => {
            this._updateDisplayItems();
        }));
        this._updateDisplayItems();
        this.changeDetector.detectChanges();

    }

    public ngOnDestroy() {
        this._subs.forEach((x) => x.unsubscribe());
    }

    public updateViewPortItems(items) {
        this.viewPortItems = items;
        this.changeDetector.markForCheck();
    }

    /**
     * Test if the given key is in the list of selected items.
     */
    public isSelected(key: string): boolean {
        return this.selection.has(key);
    }

    /**
     * Test to check if the given key is the active item.
     */
    public isActive(key: string): boolean {
        return this.config.activable && Boolean(this.activeItem === key);
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
        this.onSelectedChange(key, !this.selection.has(key));
    }

    /**
     * Toggle selection on the given item.
     * If there is one item selected it will also select the active item.
     * If you unselect the last item(Expect the active one) it wil
     * @param key Item unique key
     * @param selected If the item with the given key should be selected
     */
    public onSelectedChange(key: string, selected: boolean) {
        const selection = new ListSelection(this.selection);
        selection.select(key, selected);
        this.selection = selection;
        this._updateSelectedItems();
    }

    public handleScrollChange(event) {
        const show = event.target.scrollTop > 0;
        if (this.showScrollShadow !== show) {
            this.showScrollShadow = show;
            this.changeDetector.markForCheck();
        }
    }

    /**
     * Clear the selection by removing all selected items but the active one if applicable.
     */
    public clearSelection() {
        this.selection = new ListSelection();
        this._updateSelectedItems();
    }

    /**
     * Select items from the active item to the selected one.
     */
    public selectTo(key: string) {
        let foundStart = false;
        const activeKey = this.activeItem;
        const selection = new ListSelection(this.selection);
        this.displayItems.some((item) => {
            if (!foundStart && (item.key === activeKey || item.key === key)) {
                foundStart = true;
                selection.add(item.key);
            } else if (foundStart) {
                selection.add(item.key);
                // Reached the end of the selection
                if (item.key === activeKey || item.key === key) {
                    return true;
                }
            }
        });
        this.selection = selection;
    }

    @autobind()
    public onFocus(event: FocusEvent) {
        this.listFocused = true;
        if (!this.focusedItem.value) {
            if (this.activeItem) {
                this.focusedItem.next(this.activeItem);
            } else {
                const first = this.items.first;
                this.focusedItem.next(first && first.key);
            }
            this.changeDetector.markForCheck();
        }
    }

    @autobind()
    public onBlur(event) {
        this.listFocused = false;
        this.focusedItem.next(null);
        this.changeDetector.markForCheck();
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

    public trackItem(index, item) {
        return item.key;
    }

    /**
     * Implement this to apply some sorting or other logic
     */
    protected computeDisplayedItems?(): AbstractListItemBase[];

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
            item.selected = Boolean(this.selection.has(item.key));
        });
        this.changeDetector.markForCheck();
    }
}
