import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    HostBinding,
    TemplateRef,
    forwardRef,
} from "@angular/core";

import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { AbstractListBase } from "../abstract-list";
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
    providers: [
        { provide: AbstractListBase, useExisting: forwardRef(() => QuickListComponent) },
    ],
})
export class QuickListComponent extends AbstractListBase {
    @ContentChild(QuickListRowStatusDirective, { read: TemplateRef }) public statusDef: TemplateRef<any>;
    @ContentChild(QuickListRowTitleDirective, { read: TemplateRef }) public titleDef: TemplateRef<any>;
    @ContentChild(QuickListRowStateDirective, { read: TemplateRef }) public stateDef: TemplateRef<any>;
    @ContentChild(QuickListRowExtraDirective, { read: TemplateRef }) public extraDef: TemplateRef<any>;

    @HostBinding("attr.role") public readonly role = "listbox";
    @HostBinding("attr.aria-multiselectable") public ariaMultiSelectable = true;

    constructor(
        contextMenuService: ContextMenuService,
        router: Router,
        breadcrumbService: BreadcrumbService,
        changeDetector: ChangeDetectorRef) {
        super(contextMenuService, router, breadcrumbService, changeDetector);
    }

}
