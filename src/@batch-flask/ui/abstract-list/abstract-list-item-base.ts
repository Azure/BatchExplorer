import { Input, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { log } from "@batch-flask/utils";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AbstractListBase } from "./abstract-list-base";

/**
 * Usage: Needs to be used with a SelectableListBase
 * 1. Inject the component inheriting SelectableListBase in the construtor using @Inject and forwardRef
 */
export class AbstractListItemBase implements OnDestroy, OnInit {
    /**
     * Unique key to give to the list used for knowing if the item is selected
     */
    @Input() public key: string;

    public get id() { return this.key; }

    @Input("link")
    public set routerLink(routerLink: any) {
        this._routerLink = routerLink;
        if (routerLink) {
            this.urlTree = this.router.createUrlTree(routerLink);
        }
    }
    public get routerLink() { return this._routerLink; }

    public isFocused: Observable<boolean>;

    /**
     * If the item is selected(!= active)
     */
    public selected: boolean = null;

    public get active(): boolean {
        return this.list && this.list.activeItem === this.key;
    }

    public urlTree: any = null;

    private _routerLink: any = null;
    /**
     * Need to inject list
     * e.g.  @Inject(forwardRef(() => QuickListComponent)) list: QuickListComponent
     */
    constructor(
        protected list: AbstractListBase,
        private router: Router) {

        this.isFocused = this.list.focusedItem.pipe(map(x => x === this.key));
    }

    public ngOnInit() {
        if (!this.key) {
            log.error(`Every list item needs to have a key. Use this attribute [key]="item.id"`, this);
        }
        this.selected = this.list.isSelected(this.key);
    }

    public ngOnDestroy() {
        this.list = null;
    }

    public openContextMenu() {
        this.list.openContextMenu(this);
    }
}
