import {
    Component, Inject, Input, OnInit, forwardRef,
} from "@angular/core";
import { Router } from "@angular/router";

import { SelectableListItemBase } from "../selectable-list/selectable-list-item-base";
import { QuickListComponent } from "./quick-list.component";

@Component({
    selector: "bex-quick-list-item",
    templateUrl: "quick-list-item.html",
})
export class QuickListItemComponent extends SelectableListItemBase implements OnInit {
    /**
     * Unique key to give to the list used for knowing if the item is selected
     */
    @Input()
    public key: string;

    @Input()
    public routerLink: any;

    public get routerLinkActiveClass() {
        return this.routerLink ? "selected" : null;
    }

    // tslint:disable:no-forward-ref
    constructor( @Inject(forwardRef(() => QuickListComponent)) list: QuickListComponent, router: Router) {
        super(list, router);
    }
}
