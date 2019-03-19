import {
    ChangeDetectorRef,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    Output,
    ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { ListKeyNavigator, ListView } from "@batch-flask/core";
import { KeyCode } from "@batch-flask/core/keys";
import { ListSelection, SelectableList } from "@batch-flask/core/list";
import { ListDataPresenter, SortingInfo } from "@batch-flask/ui/abstract-list/list-data-presenter";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import {
    ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuService, MultiContextMenuItem,
} from "@batch-flask/ui/context-menu";
import { EntityCommands } from "@batch-flask/ui/entity-commands";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { SanitizedError } from "@batch-flask/utils";
import { List } from "immutable";
import * as inflection from "inflection";
import { Subscription, of } from "rxjs";
import { skip } from "rxjs/operators";
import { VirtualScrollComponent } from "../virtual-scroll";
import { AbstractListItem } from "./abstract-list-item";
import { ListDataProvider } from "./list-data-provider";
import { ListSortConfig, SortDirection, SortingStatus } from "./list-data-sorter";

export interface AbstractListBaseConfig<TEntity = any> {
    /**
     * If it should allow the user to activate an item
     * @default true
     */
    activable?: boolean;

    /**
     * If it should allow the user to navigate. Need activable true
     * @default true
     */
    navigable?: boolean;

    /**
     * What is the buffer for trigerring scroll to the bottom event
     * @default 0
     */
    scrollBottomBuffer?: number;

    /**
     * Force breadcrumb to be appended
     */
    forceBreadcrumb?: boolean;

    /**
     * Sorting definition. Specify here what column can be sorted and how
     */
    sorting?: ListSortConfig<TEntity> | null | false;

    /**
     * Id used to preserve settings for the list(Last sort)
     */
    id?: string;
}

export const abstractListDefaultConfig: Required<AbstractListBaseConfig> = {
    activable: true,
    navigable: true,
    scrollBottomBuffer: 0,
    forceBreadcrumb: false,
    sorting: null,
    id: undefined,
};

const lastSorting: StringMap<SortingInfo> = {};

/**
 * Base class for quick-list and table component
 *
 * Usage:
 * 1. Extend class
 * 2. Refefine items with @ContentChildren and the class that inherit fSelectableListItemBase
 */
export class AbstractListBase extends SelectableList implements OnDestroy {
    public LoadingStatus = LoadingStatus;
    public SortingStatus = SortingStatus;

    @Input() @HostBinding("attr.id") public id: string;
    @Input() public commands: EntityCommands<any>;
    @Input() public status: LoadingStatus;
    @Input() public set data(
        data: ListView<any, any> | List<AbstractListItem> | Iterable<AbstractListItem>) {
        this.dataProvider.data = data;
    }
    @HostBinding("attr.aria-activedescendant")
    public get ariaActiveDescendent() {
        if (this.focusedItem) {
            const base = `${this.id}-row-${this.focusedItem.id}`;
            if (this.focusedColumn != null) {
                return `${base}-col-${this.focusedColumn}`;
            } else {
                return base;
            }
        } else {
            return null;
        }
    }

    public set items(items: any[]) {
        this._items = items;
        this._keyNavigator.items = this.items;
        this.changeDetector.markForCheck();
    }
    public get items() { return this._items; }

    @Input() public set config(config: AbstractListBaseConfig) {
        this._config = { ...abstractListDefaultConfig, ...config };
        this.dataPresenter.config = this._config.sorting;

        if (this._config.id) {
            const lastSortingKey = lastSorting[this._config.id];
            if (lastSortingKey) {
                this.dataPresenter.sortBy(lastSortingKey.key, lastSortingKey.direction);
            }
        }
    }
    public get config() { return this._config; }

    @HostBinding("style.display")
    public get showComponent() {
        const hide = this.items.length === 0 && this.status === LoadingStatus.Ready;
        return hide ? "none" : null;
    }

    public set selection(selection: ListSelection) {
        super.selection = selection;
        this.changeDetector.markForCheck();
    }
    public get selection() { return super.selection; }

    // Aria
    @HostBinding("attr.tabindex") public readonly tabindex = 0;
    @HostBinding("attr.aria-multiselectable") public ariaMultiSelectable = true;

    @Output() public scrollBottom = new EventEmitter();

    public listFocused: boolean = false;
    public focusedItem: AbstractListItem | null;
    /**
     * Which column is focused. For accessibility we need to have column navigation as well
     */
    public focusedColumn: number | null = null;
    public showScrollShadow: boolean;
    public sortingStatus: SortingStatus;
    public dataProvider: ListDataProvider;
    public dataPresenter: ListDataPresenter;

    protected _config: Required<AbstractListBaseConfig> = abstractListDefaultConfig;
    protected _keyNavigator: ListKeyNavigator<AbstractListItem>;

    @ViewChild(VirtualScrollComponent) private _virtualScroll: VirtualScrollComponent;
    private _subs: Subscription[] = [];
    private _items: any[] = [];

    private _clicking = false;

    constructor(
        private contextmenuService: ContextMenuService,
        private router: Router,
        private breadcrumbService: BreadcrumbService,
        private elementRef: ElementRef,
        changeDetection: ChangeDetectorRef) {
        super(changeDetection);
        this._initKeyNavigator();

        this.dataProvider = new ListDataProvider();
        this.dataPresenter = new ListDataPresenter(this.dataProvider);

        this.dataProvider.status.subscribe((status) => {
            this.status = status;
            this.changeDetector.markForCheck();
        });

        this.dataPresenter.items.subscribe((items) => {
            this.items = items;
            this.changeDetector.markForCheck();
        });

        this.dataPresenter.sortingStatus.subscribe((sortingStatus) => {
            this.sortingStatus = sortingStatus;
            this.changeDetector.markForCheck();
        });
        this.dataPresenter.sortingByObs.pipe(skip(1)).subscribe((sortBy) => {
            if (this._config.id) {
                lastSorting[this._config.id] = sortBy;
            }
        });

    }

    public ngOnDestroy() {
        this._subs.forEach((x) => x.unsubscribe());
        this.dataProvider.dispose();
        this.dataPresenter.dispose();
        if (this._keyNavigator) {
            this._keyNavigator.dispose();
        }
    }

    public focus() {
        this.elementRef.nativeElement.focus();
    }

    public updateViewPortItems(items) {
        if (items.length === this.items.length) {
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
        return Boolean(this.config.activable && this.activeItem === key);
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
        this.changeDetector.markForCheck();
    }

    public handleScrollChange(event) {
        const show = event.target.scrollTop > 0;
        const bottom = event.target.scrollTop + event.target.offsetHeight;
        const hitBottom = event.target.scrollHeight - bottom <= this._config.scrollBottomBuffer;
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
        this.changeDetector.markForCheck();
    }

    /**
     * Select items from the active item to the selected one.
     */
    public selectTo(key: string) {
        let foundStart = false;
        const activeKey = this.activeItem;
        const selection = new ListSelection(this.selection);
        this.items.some((item: any) => {
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
            return false;
        });
        this.selection = selection;
    }

    @HostListener("mousedown")
    public handleMousedown() {
        this._clicking = true;
    }

    @HostListener("mouseup")
    public handleMouseup() {
        this._clicking = false;
    }

    @HostListener("focus", ["$event"])
    public handleFocusViaKeyboard(event: FocusEvent) {
        this.listFocused = true;
        if (!this._clicking) {
            this._pickFocusedItem();
        }
        this.changeDetector.markForCheck();
    }

    /**
     * When an item is being focused out, check if its because we are focusing another.
     * - If so all good.
     * - Otherwise means we focused out of the list
     * @param event FocusEvent emitted
     * @param item Item displayed in the row
     */
    @HostListener("blur", ["$event"])
    public handleBlur(_: FocusEvent) {
        this.listFocused = false;
        this._keyNavigator.focusColumn(-1);
        this.changeDetector.markForCheck();
    }

    public setFocusedItem(item: AbstractListItem) {
        this._keyNavigator.focusItem(item);
        this.changeDetector.markForCheck();
    }

    @HostListener("keydown", ["$event"])
    public keyPressed(event: KeyboardEvent) {
        if (event.code === KeyCode.Space || event.code === KeyCode.Enter) {
            this.activateItem(this.focusedItem);
            event.preventDefault();
        } else {
            let previousFocussedId = null;
            if (event.shiftKey) {
                const focusedItem = this._keyNavigator.focusedItem;
                previousFocussedId = focusedItem && focusedItem.id;
            } else {
                this.clearSelection();
            }
            // Handle the navigation
            this._keyNavigator.onKeydown(event);

            const focusedItem = this._keyNavigator.focusedItem;
            const focussedId = focusedItem && focusedItem.id;
            if (previousFocussedId && previousFocussedId !== focussedId) {
                if (!focussedId) { return; }
                if (this.selection.has(focussedId)) {
                    this.selection.delete(previousFocussedId);
                } else {
                    this.selection.add(focussedId);
                }
            }
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

    public trackItem(_: number, item: AbstractListItem) {
        return item.id;
    }

    public activateItem(item: AbstractListItem | null) {
        this.activeItem = item && item.id;
        if (!item) { return; }
        const link = item.routerLink;
        if (this.config.navigable && link) {
            if (this.config.forceBreadcrumb) {
                this.breadcrumbService.navigate(link);
            } else {
                try {
                    this.router.navigate(link);
                } catch (e) {
                    throw new SanitizedError(e.toString());
                }
            }
        }
    }

    public openContextMenu(target?: any) {
        if (!this.commands && !this.config.sorting) { return; }

        let selection = this.selection;

        // If we right clicked on an non selected item it will just make this the context menu selection
        if (target && !selection.has(target.id)) {
            selection = new ListSelection({ keys: [target.id] });
        }

        let obs;
        if (this.commands) {
            obs = this.commands.contextMenuFromSelection(selection);
        } else {
            obs = of(new ContextMenu([]));
        }
        obs.subscribe((menu) => {
            if (!menu) { return; }

            if (this.config.sorting) {
                if (this.commands) {
                    menu.addItem(new ContextMenuSeparator());
                }
                menu.addItem(this._createSortByMenu());
            }

            this.contextmenuService.openMenu(menu);
        });
    }

    private _pickFocusedItem() {
        if (!this._keyNavigator.focusedItem) {
            if (this.activeItem) {
                this._keyNavigator.focusItem(this.items.find(x => x.id === this.activeItem));
            } else {
                this._keyNavigator.focusFirstItem();
            }
            this.changeDetector.markForCheck();
        }
    }

    /** Sets up a key manager to listen to keyboard events on the overlay panel. */
    private _initKeyNavigator() {
        this._keyNavigator = new ListKeyNavigator<AbstractListItem>()
            .withWrap();

        this._keyNavigator.change.subscribe(() => {
            this.focusedItem = this._keyNavigator.focusedItem;
            this.focusedColumn = this._keyNavigator.focusedColumn;
            this._virtualScroll.ensureItemVisible(this.focusedItem);
            this.changeDetector.markForCheck();
        });
    }

    private _createSortByMenu() {
        const sortOptions = Object.keys(this._config.sorting as any).map((key) => {
            return new ContextMenuItem({
                label: inflection.humanize(inflection.underscore(key)),
                click: () => {
                    this.dataPresenter.sortBy(key);
                },
                checked: this.dataPresenter.sortingBy.key === key,
                type: "checkbox",
            });
        });

        const ascending = this.dataPresenter.sortingBy.direction === SortDirection.Asc;
        const sortDirections = [
            new ContextMenuItem({
                label: "Ascending",
                click: () => {
                    this.dataPresenter.updateSortDirection(SortDirection.Asc);
                },
                checked: ascending,
                type: "checkbox",
            }),
            new ContextMenuItem({
                label: "Descending",
                click: () => {
                    this.dataPresenter.updateSortDirection(SortDirection.Desc);
                },
                checked: !ascending,
                type: "checkbox",
            }),
        ];
        return new MultiContextMenuItem({
            label: "Sort by",
            subitems: [
                new ContextMenuItem({
                    label: "Default",
                    click: () => {
                        this.dataPresenter.sortBy(null);
                    },
                    checked: this.dataPresenter.sortingBy.key === null,
                    type: "checkbox",
                }),
                ...sortOptions,
                new ContextMenuSeparator(),
                ...sortDirections,
            ],
        });
    }

}
