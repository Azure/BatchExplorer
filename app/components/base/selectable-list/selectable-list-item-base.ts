import {
    Input, OnInit,
} from "@angular/core";
import { Router } from "@angular/router";

import { SelectableListBase } from "./selectable-list-base";

/**
 * Usage: Needs to be used with a SelectableListBase
 * 1. Inject the component inheriting SelectableListBase in the construtor using @Inject
 * 2. Redefine key, routerLink with the decorator
 * 3. Call handle click in html (click)="handleClick($event)"
 */
export class SelectableListItemBase implements OnInit {
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
            this.checkActive();
        }
    }
    public get routerLink() { return this._routerLink; }

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
    constructor(protected list: SelectableListBase, private router: Router) {

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

    public handleClick(event: MouseEvent) {
        const shiftKey = event.shiftKey;
        const ctrlKey = event.ctrlKey;

        // Prevent the routerlink from being activated if we have shift or ctrl
        if (shiftKey || ctrlKey) {
            const activeItem = this.list.getActiveItem();
            if (!activeItem) {
                return;
            }

            if (shiftKey) {
                this.list.selectTo(this.key);
            } else if (ctrlKey) {
                this.selected = true;
                this.list.onSelectedChange(this.key, true);
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
            this.router.navigate(this.routerLink);
        }
    }
}
