import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Input,
    OnChanges,
    Optional,
    QueryList,
    TemplateRef,
} from "@angular/core";

import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { AbstractListBase } from "../abstract-list";
import { FocusSectionComponent } from "../focus-section";
import { QuickListRowDefDirective } from "./quick-list-row-def";

import { Router } from "@angular/router";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { List } from "immutable";

import "./quick-list.scss";

@Component({
    selector: "bl-quick-list",
    templateUrl: "quick-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickListComponent extends AbstractListBase implements OnChanges {
    @Input() public data: List<any> | any[] = List([]);
    @ContentChild(QuickListRowDefDirective, { read: TemplateRef }) public rowDef: TemplateRef<any>;

    constructor(
        contextMenuService: ContextMenuService,
        router: Router,
        breadcrumbService: BreadcrumbService,
        changeDetector: ChangeDetectorRef,
        @Optional() focusSection?: FocusSectionComponent) {
        super(contextMenuService, router, breadcrumbService, changeDetector, focusSection);
    }

    public ngOnChanges() {
        if (this.data) {
            this.displayItems = this._getItems();
        }
    }

    private _getItems() {
        if (!this.data) {
            return [];
        } else if (this.data instanceof List) {
            return (this.data as List<any>).toArray();
        } else if (Array.isArray(this.data)) {
            return this.data;
        } else {
            return [...this.data as any];
        }
    }
}
