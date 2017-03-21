import {
    Component, Inject, OnInit, forwardRef,
} from "@angular/core";
import { Router } from "@angular/router";

import { BreadcrumbService } from "app/components/base/breadcrumbs";
import { ContextMenuService } from "app/components/base/context-menu";
import { AbstractListItemBase } from "../abstract-list";
import { QuickListComponent } from "./quick-list.component";

@Component({
    selector: "bl-quick-list-item",
    templateUrl: "quick-list-item.html",
})
export class QuickListItemComponent extends AbstractListItemBase implements OnInit {
    public get routerLinkActiveClass() {
        return this.routerLink ? "selected" : null;
    }

    // tslint:disable:no-forward-ref
    constructor(
        @Inject(forwardRef(() => QuickListComponent)) list: QuickListComponent,
        router: Router,
        contextmenuService: ContextMenuService,
        breadcrumbService: BreadcrumbService) {
        super(list, router, contextmenuService, breadcrumbService);
    }
}
