import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    HostBinding,
    Input,
    TemplateRef,
    forwardRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { ContextService } from "@batch-flask/core";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { AbstractListBase } from "../abstract-list";
import {
    QuickListRowExtraDirective,
    QuickListRowStateDirective,
    QuickListRowStatusDirective,
    QuickListRowTitleDirective,
} from "./quick-list-row-def";
import { I18nService } from "@batch-flask/core";

import "./quick-list.scss";

let idCounter = 0;

@Component({
    selector: "bl-quick-list",
    templateUrl: "quick-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: AbstractListBase, useExisting: forwardRef(() => QuickListComponent) },
    ],
})
export class QuickListComponent extends AbstractListBase {
    @Input() public id = `bl-quick-list-${idCounter++}`;

    @ContentChild(QuickListRowStatusDirective, { read: TemplateRef, static: true }) public statusDef: TemplateRef<any>;
    @ContentChild(QuickListRowTitleDirective, { read: TemplateRef, static: true }) public titleDef: TemplateRef<any>;
    @ContentChild(QuickListRowStateDirective, { read: TemplateRef, static: true }) public stateDef: TemplateRef<any>;
    @ContentChild(QuickListRowExtraDirective, { read: TemplateRef, static: true }) public extraDef: TemplateRef<any>;

    @HostBinding("attr.role") public readonly role = "listbox";

    @HostBinding("attr.aria-label") public get ariaLabel() {
        return this.i18n.translate("common.listbox");
    }

    constructor(
        contextMenuService: ContextMenuService,
        router: Router,
        elementRef: ElementRef,
        breadcrumbService: BreadcrumbService,
        contextService: ContextService,
        changeDetector: ChangeDetectorRef,
        private i18n: I18nService) {
        super(contextMenuService, router, breadcrumbService, elementRef, contextService, changeDetector);
    }
}
