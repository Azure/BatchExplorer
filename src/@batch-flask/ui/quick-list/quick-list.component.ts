import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Optional, QueryList,
} from "@angular/core";

import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { AbstractListBase } from "../abstract-list";
import { FocusSectionComponent } from "../focus-section";
import { QuickListItemComponent } from "./quick-list-item";

import { Router } from "@angular/router";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import "./quick-list.scss";

@Component({
    selector: "bl-quick-list",
    templateUrl: "quick-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickListComponent extends AbstractListBase implements AfterContentInit {
    @ContentChildren(QuickListItemComponent)
    public quickListItems: QueryList<QuickListItemComponent>;

    constructor(
        contextMenuService: ContextMenuService,
        router: Router,
        breadcrumbService: BreadcrumbService,
        changeDetector: ChangeDetectorRef,
        @Optional() focusSection?: FocusSectionComponent) {
        super(contextMenuService, router, breadcrumbService, changeDetector, focusSection);
    }

    public ngAfterContentInit() {
        this.quickListItems.changes.subscribe(() => {
            this.items = this.quickListItems.toArray();
        });
        this.items = this.quickListItems.toArray();
    }
}
