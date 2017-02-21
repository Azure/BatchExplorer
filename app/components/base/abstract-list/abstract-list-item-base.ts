import { Input, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

import { BreadcrumbService } from "app/components/base/breadcrumbs";
import { log } from "app/utils";
import { AbstractListBase } from "./abstract-list-base";


/**
 * Usage: Needs to be used with a SelectableListBase
 * 1. Inject the component inheriting SelectableListBase in the construtor using @Inject and forwardRef
 */
export class AbstractListItemBase implements OnDestroy, OnInit {
    /**
     * Unique key to give to the list used for knowing if the item is selected
     */
    @Input()
    public key: string;

    @Input()
    public set routerLink(routerLink: any) {
        this._routerLink = routerLink;
        if (routerLink) {
            this.urlTree = this.router.createUrlTree(routerLink);
        }
    }
    public get routerLink() { return this._routerLink; }

    @Input()
    public forceBreadcrumb = false;

    /**
     * If the item is selected(!= active)
     */
    public selected: boolean = null;

    public get active(): boolean {
        return this.list && this._activeItemKey === this.key;
    };

    public urlTree: any = null;

    private _routerLink: any = null;
    private _activeItemKey: string = null;
    private _activeSub: Subscription;
    private _selectedSub: Subscription;
    /**
     * Need to inject list
     * e.g.  @Inject(forwardRef(() => QuickListComponent)) list: QuickListComponent
     */
    constructor(
        protected list: AbstractListBase,
        private router: Router,
        private breadcrumbService: BreadcrumbService) {

        this._activeSub = list.activatedItemChange.subscribe((event) => {
            this._activeItemKey = event && event.key;
        });

        this._selectedSub = list.selectedItemsChange.subscribe(() => {
            this.selected = this.list.isSelected(this.key);
        });
    }

    public ngOnInit() {
        if (!this.key) {
            log.error(`Every list item needs to have a key. Use this attribute [key]="item.id"`, this);
        }
        this.selected = this.list.isSelected(this.key);
    }

    public ngOnDestroy() {
        if (this._activeSub) {
            this._activeSub.unsubscribe();
        }
        if (this._selectedSub) {
            this._selectedSub.unsubscribe();
        }
    }

    /**
     * If the current item is active(Router)
     */
    public get isFocused(): boolean {
        return this.list.focusedItem === this.key;
    }

    public handleClick(event: MouseEvent) {
        const shiftKey = event.shiftKey;
        const ctrlKey = event.ctrlKey || event.metaKey;

        // Prevent the routerlink from being activated if we have shift or ctrl
        if (shiftKey || ctrlKey) {
            const activeItem = this._activeItemKey;
            if (!activeItem) {
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
        } else {
            // Means the user actually selected the item
            this.activateItem();
        }
    }
    /**
     * Mark the item as active and trigger the router if applicable
     * Will desactivate the current activate item
     */
    public activateItem() {
        this.list.setActiveItem(this.key);
        this._triggerRouter();
    }

    public openContextMenu() {

    }
    /**
     * Just trigger the router the item will not be marked as active
     */
    private _triggerRouter() {
        if (this.routerLink) {
            if (this.forceBreadcrumb) {
                this.breadcrumbService.navigate(this.routerLink);
            } else {
                this.router.navigate(this.routerLink);
            }
        }
    }
}


