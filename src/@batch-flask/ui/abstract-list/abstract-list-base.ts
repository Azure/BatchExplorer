import {
    ChangeDetectorRef, EventEmitter,
    Input, OnDestroy, Output, ViewChild,
} from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";

import { Router } from "@angular/router";
import { autobind } from "@batch-flask/core";
import { ListSelection, SelectableList } from "@batch-flask/core/list";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { EntityCommands } from "@batch-flask/ui/entity-commands";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { FocusSectionComponent } from "../focus-section";
import { VirtualScrollComponent } from "../virtual-scroll";
import { AbstractListItemBase } from "./abstract-list-item-base";

export interface AbstractListBaseConfig {
    /**
     * If it should allow the user to activate an item(And the routerlink if applicable)
     * @default true
     */
    activable?: boolean;

    /**
     * What is the buffer for trigerring scroll to the bottom event
     * @default 0
     */
    scrollBottomBuffer?: number;
}

export const abstractListDefaultConfig: AbstractListBaseConfig = {
    activable: true,
    scrollBottomBuffer: 0,
};

/**
 * Base class for quick-list and table component
 *
 * Usage:
 * 1. Extend class
 * 2. Refefine items with @ContentChildren and the class that inherit SelectableListItemBase
 */
export class AbstractListBase extends SelectableList implements OnDestroy {
    public LoadingStatus = LoadingStatus;
    @Output() public scrollBottom = new EventEmitter();
    @Input() public commands: EntityCommands<any>;
    @Input() public forceBreadcrumb = false;

    public set items(items: any[]) {
        this._items = items;
        this._updateDisplayItems();
    }
    public get items() { return this._items; }

    @ViewChild(VirtualScrollComponent) public virtualScrollComponent: VirtualScrollComponent;

    /**
     * List of items to display(Which might be different from the full items list because of sorting and other)
     */
    public displayItems: any[] = [];

    /**
     * List of items that are currently being displayed with the virtual scroll
     */
    public viewPortItems: AbstractListItemBase[] = [];

    @Input() public set config(config: AbstractListBaseConfig) {
        this._config = { ...abstractListDefaultConfig, ...config };
    }
    public get config() { return this._config; }

    @Input() public status: LoadingStatus;

    // TODO-TIM handle this
    // @HostBinding("style.display")
    // public get showComponent() {
    //     const hide = this.displayItems.length === 0 && this.status === LoadingStatus.Ready;
    //     return hide ? "none" : "block";
    // }

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
    private _items: any[] = [];

    constructor(
        private contextmenuService: ContextMenuService,
        private router: Router,
        private breadcrumbService: BreadcrumbService,
        changeDetection: ChangeDetectorRef,
        focusSection: FocusSectionComponent) {
        super(changeDetection);

        if (focusSection) {
            this._subs.push(focusSection.keypress.subscribe(this.keyPressed));
            this._subs.push(focusSection.onFocus.subscribe(this.onFocus));
            this._subs.push(focusSection.onBlur.subscribe(this.onBlur));
        }
    }

    public ngOnDestroy() {
        this._subs.forEach((x) => x.unsubscribe());
    }

    public updateViewPortItems(items) {
        this.viewPortItems = items;
        if (items.length === this.displayItems.length) {
            this.scrollBottom.emit();
        }
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
        const bottom = event.target.scrollTop + event.target.offsetHeight;
        const hitBottom = event.target.scrollHeight - bottom <= this.config.scrollBottomBuffer;
        if (this.showScrollShadow !== show) {
            this.showScrollShadow = show;
            this.changeDetector.markForCheck();
        }

        if (hitBottom) {
            this.scrollBottom.emit();
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
            const id = item.id || item.key;
            if (!foundStart && (id === activeKey || id === key)) {
                foundStart = true;
                selection.add(id);
            } else if (foundStart) {
                selection.add(id);
                // Reached the end of the selection
                if (id === activeKey || id === key) {
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
                const first = this.items.first();
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
        this.changeDetector.markForCheck();
    }

    @autobind()
    public keyPressed(event: KeyboardEvent) {
        const items: any[] = this.displayItems;
        let index = 0;
        let currentItem;
        for (const item of items) {
            if (item.id === this.focusedItem.value) {
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
                this.activateItem(currentItem);
                event.preventDefault();
                return;
            default:
        }
        index = (index + items.length) % items.length;
        const newItem = items[index];
        this.focusedItem.next(newItem.id);
    }

    public handleClick(event: MouseEvent, item, activate = true) {
        this.setFocusedItem(item);

        if (event) {
            const shiftKey = event.shiftKey;
            const ctrlKey = event.ctrlKey || event.metaKey;
            // Prevent the routerlink from being activated if we have shift or ctrl
            if (shiftKey || ctrlKey) {
                const focusedItem = this.focusedItem.value;
                if (!focusedItem) {
                    return;
                }

                if (shiftKey) {
                    this.selectTo(item.id);
                } else if (ctrlKey) {
                    this.onSelectedChange(item.id, this.selection.has(item.id));
                }
                event.stopPropagation();
                event.stopImmediatePropagation();
            }
        }

        if (activate) {
            if (this.config.activable) {
                // Means the user actually selected the item
                this.activateItem(item);
            } else {
                const isSelected = this.selection.has(item.id);
                this.clearSelection();
                this.onSelectedChange(item.id, !isSelected);
            }
        } else {
            this.toggleSelected(item.id, event);
        }
    }

    public trackItem(index, item) {
        return item.id;
    }

    public activateItem(item: any) {
        this.activeItem = item.id;
        const link = item.routerLink || item.link; // TODO-TIM standarize
        if (link) {
            if (this.forceBreadcrumb) {
                this.breadcrumbService.navigate(link);
            } else {
                this.router.navigate(link);
            }
        }
    }

    public openContextMenu(target?: any) {
        if (!this.commands) { return; }

        let selection = this.selection;

        // If we right clicked on an non selected item it will just make this the context menu selection
        if (target && !selection.has(target.id)) {
            selection = new ListSelection({ keys: [target.id] });
        }

        this.commands.contextMenuFromSelection(selection).subscribe((menu) => {
            if (menu) {
                this.contextmenuService.openMenu(menu);
            }
        });
    }

    /**
     * Implement this to apply some sorting or other logic
     */
    protected computeDisplayedItems?(): AbstractListItemBase[];

    private _updateDisplayItems() {
        if (this.computeDisplayedItems) {
            this.displayItems = this.computeDisplayedItems();
        } else {
            this.displayItems = this.items;
        }
        this._updateSelectedItems();
    }

    /**
     * Update the items to mark which ones are selected
     */
    private _updateSelectedItems() {
        this.displayItems.forEach((item) => {
            item.selected = Boolean(this.selection.has(item.id));
        });
        this.changeDetector.markForCheck();
    }
}
