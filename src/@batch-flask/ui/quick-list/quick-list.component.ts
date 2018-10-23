import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    Host,
    HostBinding,
    Optional,
    TemplateRef,
} from "@angular/core";

import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { AbstractListBase } from "../abstract-list";
import { FocusSectionComponent } from "../focus-section";
import {
    QuickListRowExtraDirective,
    QuickListRowStateDirective,
    QuickListRowStatusDirective,
    QuickListRowTitleDirective,
} from "./quick-list-row-def";

import { Router } from "@angular/router";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";

import "./quick-list.scss";

@Component({
    selector: "bl-quick-list",
    templateUrl: "quick-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickListComponent extends AbstractListBase {
    @ContentChild(QuickListRowStatusDirective, { read: TemplateRef }) public statusDef: TemplateRef<any>;
    @ContentChild(QuickListRowTitleDirective, { read: TemplateRef }) public titleDef: TemplateRef<any>;
    @ContentChild(QuickListRowStateDirective, { read: TemplateRef }) public stateDef: TemplateRef<any>;
    @ContentChild(QuickListRowExtraDirective, { read: TemplateRef }) public extraDef: TemplateRef<any>;

    @HostBinding("attr.role") public readonly role = "listbox";
    @HostBinding("attr.aria-multiselectable") public ariaMultiSelectable = true;
    @HostBinding("attr.set-size") public get ariaSetSize() {
        return this.items.length;
    }
    constructor(
        contextMenuService: ContextMenuService,
        router: Router,
        breadcrumbService: BreadcrumbService,
        changeDetector: ChangeDetectorRef,
        @Optional() focusSection?: FocusSectionComponent) {
        super(contextMenuService, router, breadcrumbService, changeDetector, focusSection);
    }

}
