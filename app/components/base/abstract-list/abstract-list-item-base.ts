import { Input, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";

import { BreadcrumbService } from "app/components/base/breadcrumbs";
import { ContextMenuService } from "app/components/base/context-menu";
import { log } from "app/utils";
import { ContextMenu } from "../context-menu";
import { AbstractListBase } from "./abstract-list-base";

/**
 * Usage: Needs to be used with a SelectableListBase
 * 1. Inject the component inheriting SelectableListBase in the construtor using @Inject and forwardRef
 */
export class AbstractListItemBase implements OnDestroy, OnInit {
    @Input()
    public contextmenu: ContextMenu;

    /**
     * Unique key to give to the list used for knowing if the item is selected
     */
    @Input()
    public key: string;

    @Input()
    public set link(routerLink: any) {
        this._routerLink = routerLink;
        if (routerLink) {
            this.urlTree = this.router.createUrlTree(routerLink);
        }
    }
    public get link() { return this._routerLink; }

    @Input()
    public forceBreadcrumb = false;

    public isFocused: Observable<boolean>;

    /**
     * If the item is selected(!= active)
     */
    public selected: boolean = null;

    public get active(): boolean {
        return this.list && this._activeItemKey === this.key;
    }

    public urlTree: any = null;

    private _routerLink: any = null;
    private _activeItemKey: string = null;
    private _activeSub: Subscription;
    /**
     * Need to inject list
     * e.g.  @Inject(forwardRef(() => QuickListComponent)) list: QuickListComponent
     */
    constructor(
        protected list: AbstractListBase,
        private router: Router,
        private contextmenuService: ContextMenuService,
        private breadcrumbService: BreadcrumbService) {

        this.isFocused = this.list.focusedItem.map(x => x === this.key);
        this._activeSub = list.activatedItemChange.subscribe((event) => {
            this._activeItemKey = event && event.key;
        });
    }

    public ngOnInit() {
        if (!this.key) {
            log.error(`Every list item needs to have a key. Use this attribute [key]="item.id"`, this);
        }
        this.selected = this.list.isSelected(this.key);
    }

    public ngOnDestroy() {
        this.list = null;
        if (this._activeSub) {
            this._activeSub.unsubscribe();
        }
    }

    public handleClick(event: MouseEvent, activate = true) {
        this.list.setFocusedItem(this.key);

        if (event) {
            const shiftKey = event.shiftKey;
            const ctrlKey = event.ctrlKey || event.metaKey;
            // Prevent the routerlink from being activated if we have shift or ctrl
            if (shiftKey || ctrlKey) {
                const focusedItem = this.list.focusedItem.value;
                if (!focusedItem) {
                    return;
                }

                if (shiftKey) {
                    this.list.selectTo(this.key);
                } else if (ctrlKey) {
                    this.selected = !this.selected;
                    this.list.onSelectedChange(this.key, this.selected);
                }
                event.stopPropagation();
                event.stopImmediatePropagation();
                return false;
            }
        }

        if (activate) {
            if (this.list.config.activable) {
                // Means the user actually selected the item
                this.activateItem(true);
            } else {
                const isSelected = this.selected;
                this.list.clearSelection();
                this.list.onSelectedChange(this.key, !isSelected);
            }
        } else {
            this.list.toggleSelected(this.key, event);
        }
    }

    /**
     * Mark the item as active and trigger the router if applicable
     * Will desactivate the current activate item
     * @parm andFocus If we should also focus the item
     */
    public activateItem(andFocus = false) {
        this.list.setActiveItem(this.key);
        this._triggerRouter();
    }

    public openContextMenu() {
        const menu = this.contextmenu;
        if (menu) {
            this.contextmenuService.openMenu(menu);
        }
    }

    /**
     * Just trigger the router the item will not be marked as active
     */
    private _triggerRouter() {
        if (this.link) {
            if (this.forceBreadcrumb) {
                this.breadcrumbService.navigate(this.link);
            } else {
                this.router.navigate(this.link);
            }
        }
    }
}
