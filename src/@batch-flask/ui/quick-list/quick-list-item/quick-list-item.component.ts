import {
    Component, Inject, OnInit, TemplateRef, ViewChild, forwardRef,
} from "@angular/core";
import { Router } from "@angular/router";

import { AbstractListItemBase } from "@batch-flask/ui/abstract-list";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { QuickListComponent } from "../quick-list.component";

import "./quick-list-item.scss";

@Component({
    selector: "bl-quick-list-item",
    templateUrl: "quick-list-item.html",
})
export class QuickListItemComponent extends AbstractListItemBase implements OnInit {
    @ViewChild(TemplateRef) public content;

    // tslint:disable:no-forward-ref
    constructor(
        @Inject(forwardRef(() => QuickListComponent)) list: QuickListComponent,
        router: Router,
        breadcrumbService: BreadcrumbService) {
        super(list, router, breadcrumbService);
    }
}
