import {
    ChangeDetectorRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    Output,
} from "@angular/core";
import { Subscription } from "rxjs";

import { Router } from "@angular/router";
import { ListKeyNavigator, ListView, autobind } from "@batch-flask/core";
import { ENTER, SPACE } from "@batch-flask/core/keys";
import { ListSelection, SelectableList } from "@batch-flask/core/list";
import { ListDataProvider } from "@batch-flask/ui/abstract-list/list-data-provider";
import { ListDataSorter } from "@batch-flask/ui/abstract-list/list-data-sorter";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { EntityCommands } from "@batch-flask/ui/entity-commands";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { List } from "immutable";
import { FocusSectionComponent } from "../focus-section";
import { AbstractListItem } from "./abstract-list-item";

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

    /**
     * Force breadcrumb to be appended
     */
    forceBreadcrumb: boolean;
}

export const abstractListDefaultConfig: AbstractListBaseConfig = {
    activable: true,
    scrollBottomBuffer: 0,
    forceBreadcrumb: false,
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
    @Input() public commands: EntityCommands<any>;

    @Input() public set data(
        data: ListView<AbstractListItem, any> | List<AbstractListItem> | Iterable<AbstractListItem>) {
        this._dataProvider.data = data;
    }
    @Input() public status: LoadingStatus;

    public set items(items: any[]) {
        this._items = items;
        this._updateDisplayItems();
    }
    public get items() { return this._items; }

    /**
     * List of items to display(Which might be different from the full items list because of sorting and other)
     */
    public displayItems: any[] = [];

    /**
     * List of items that are currently being displayed with the virtual scroll
     */
    public viewPortItems: AbstractListItem[] = [];

    @Input() public set config(config: AbstractListBaseConfig) {
        this._config = { ...abstractListDefaultConfig, ...config };
    }
    public get config() { return this._config; }

    @Output() public scrollBottom = new EventEmitter();

    @HostBinding("style.display")
    public get showComponent() {
        const hide = this.displayItems.length === 0 && this.status === LoadingStatus.Ready;
        return hide ? "none" : "block";
    }

    public set selection(selection: ListSelection) {
        super.selection = selection;
        this._updateSelectedItems();
    }
    public get selection() { return super.selection; }

    public listFocused: boolean = false;
    public focusedItem: AbstractListItem | null;
    public showScrollShadow: boolean;

    protected _config: AbstractListBaseConfig = abstractListDefaultConfig;

    private _subs: Subscription[] = [];
    private _items: any[] = [];
    private _dataProvider: ListDataProvider;
    private _keyNavigator: ListKeyNavigator<AbstractListItem>;

    constructor(
        private contextmenuService: ContextMenuService,
        private router: Router,
        private breadcrumbService: BreadcrumbService,
        changeDetection: ChangeDetectorRef,
        focusSection: FocusSectionComponent) {
        super(changeDetection);
        this._initKeyNavigator();

        this._dataProvider = new ListDataProvider();
        if (focusSection) {
            this._subs.push(focusSection.keypress.subscribe(this.keyPressed));
            this._subs.push(focusSection.onFocus.subscribe(this.onFocus));
            this._subs.push(focusSection.onBlur.subscribe(this.onBlur));
        }

        this._dataProvider.items.subscribe((items) => {
            this.items = items;
        });

    }

    public ngOnDestroy() {
        this._subs.forEach((x) => x.unsubscribe());
        this._dataProvider.dispose();
        if (this._keyNavigator) {
            this._keyNavigator.dispose();
        }
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
        if (!this._keyNavigator.focusedItem) {
            if (this.activeItem) {
                this._keyNavigator.focusItem(this.items.find(x => x.id === this.activateItem));
            } else {
                this._keyNavigator.focusFirstItem();
            }
            this.changeDetector.markForCheck();
        }
    }

    @autobind()
    public onBlur(event) {
        this.listFocused = false;
        this._keyNavigator.focusItem(null);
        this.changeDetector.markForCheck();
    }

    public setFocusedItem(item: AbstractListItem) {
        this._keyNavigator.focusItem(item);
        this.changeDetector.markForCheck();
    }

    @autobind()
    public keyPressed(event: KeyboardEvent) {
        if (event.key === SPACE || event.key === ENTER) {
            this.activateItem(this.focusedItem);
            event.preventDefault();
        } else {
            this._keyNavigator.onKeydown(event);
        }
    }

    public handleClick(event: MouseEvent, item, activate = true) {
        this.setFocusedItem(item);

        const shiftKey = event.shiftKey;
        const ctrlKey = event.ctrlKey || event.metaKey;
        // Prevent the routerlink from being activated if we have shift or ctrl
        if (shiftKey || ctrlKey) {
            const focusedItem = this.focusedItem;
            if (!focusedItem) { return; }

            if (shiftKey) {
                this.selectTo(item.id);
            } else if (ctrlKey) {
                this.onSelectedChange(item.id, !this.selection.has(item.id));
            }
            event.stopPropagation();
            event.stopImmediatePropagation();
        } else if (activate) {
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

    public activateItem(item: AbstractListItem) {
        this.activeItem = item && item.id;
        if (!item) { return; }
        const link = item.routerLink;
        if (link) {
            if (this.config.forceBreadcrumb) {
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

    private _computeDisplayedItems() {
        return this._sortItems(this.items);
    }

    private _sortItems(items: AbstractListItem[]): AbstractListItem[] {
        const sorter = new ListDataSorter(this.config as any);

        return sorter.sortBy(items, "targetLowPriorityNodes");
    }

    private _updateDisplayItems() {
        this.displayItems = this._computeDisplayedItems();
        this._keyNavigator.items = this.displayItems;
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

    /** Sets up a key manager to listen to keyboard events on the overlay panel. */
    private _initKeyNavigator() {
        this._keyNavigator = new ListKeyNavigator<AbstractListItem>()
            .withWrap();

        this._keyNavigator.change.subscribe(() => {
            this.focusedItem = this._keyNavigator.focusedItem;
            this.changeDetector.markForCheck();
        });
    }

}
