import { HostListener, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { BreadcrumbService } from "app/components/base/breadcrumbs";
import { AbstractListBase } from "./abstract-list-base";

/**
 * Usage: Needs to be used with a SelectableListBase
 * 1. Inject the component inheriting SelectableListBase in the construtor using @Inject and forwardRef
 */
export class AbstractListItemBase implements OnInit {
    /**
     * Unique key to give to the list used for knowing if the item is selected
     */
    @Input()
    public key: string;

    @Input()
    public set routerLink(routerLink: any) {
        this._routerLink = routerLink;
        if (routerLink) {
            this._urlTree = this.router.createUrlTree(routerLink);
            // console.log("trigger check active");
            // this.checkActive();
        }
    }
    public get routerLink() { return this._routerLink; }

    @Input()
    public forceBreadcrumb = false;

    /**
     * If the item is selected(!= active)
     */
    public selected: boolean = null;
    public active: boolean = null;

    private _routerLink: any = null;
    private _urlTree: any = null;

    /**
     * Need to inject list
     * e.g.  @Inject(forwardRef(() => QuickListComponent)) list: QuickListComponent
     */
    constructor(
        protected list: AbstractListBase,
        private router: Router,
        private breadcrumbService: BreadcrumbService) {

    }

    public ngOnInit() {
        if (!this.key) {
            console.error(`Every list item needs to have a key. Use this attribute [key]="item.id"`, this);
        }
        this.selected = this.list.isSelected(this.key);
    }

    public checkActive(): boolean {
        if (this._urlTree) {
            this.active = this.router.isActive(this._urlTree, true);
        } else {
            this.active = this.list.isActive(this.key);
        }
        return this.active;
    }

    /**
     * If the current item is active(Router)
     */
    public get isFocused(): boolean {
        return this.list.focusedItem === this.key;
    }

    @HostListener("click", ["$event"])
    public handleClick(event: MouseEvent) {
        const shiftKey = event.shiftKey;
        const ctrlKey = event.ctrlKey || event.metaKey;
        console.log("Clicked on list", ctrlKey, shiftKey);

        // Prevent the routerlink from being activated if we have shift or ctrl
        if (shiftKey || ctrlKey) {
            const activeItem = this.list.getActiveItem();
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
