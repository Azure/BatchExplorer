import {
    ChangeDetectorRef, Component, ContentChildren, Input, Optional, QueryList,
} from "@angular/core";
import { Router } from "@angular/router";

import { AbstractListBase } from "../abstract-list";
import { FocusSectionComponent } from "../focus-section";
import { QuickListItemComponent } from "./quick-list-item.component";

@Component({
    selector: "bl-quick-list",
    template: `
        <ng-content></ng-content>
    `,
})
export class QuickListComponent extends AbstractListBase {
    @ContentChildren(QuickListItemComponent)
    public items: QueryList<QuickListItemComponent>;

    constructor( @Optional() focusSection: FocusSectionComponent, changeDetection: ChangeDetectorRef, router: Router) {
        super(router, changeDetection, focusSection);
    }
}

export enum ListItemStatus {
    Steady,
    Warning,
}

/**
 * Possible status for a quick list
 * - normal(Default)    show nothing special
 * - warning            show a red warning box
 * - lightaccent        show a light blue accent box
 * - accent             darker blue box
 * - important          stripped blue box
 */
export type QuickListItemStatus = "normal" | "warning" | "accent" | "lightaccent" | "important";
export const QuickListItemStatus = {
    normal: "normal" as QuickListItemStatus,
    warning: "warning" as QuickListItemStatus,
    accent: "accent" as QuickListItemStatus,
    lightaccent: "lightaccent" as QuickListItemStatus,
    important: "important" as QuickListItemStatus,
};

@Component({
    selector: "bl-quick-list-item-status",
    template: `
        <div class="status-badge" [ngClass]="status" *ngIf="tooltip" [md-tooltip]="tooltip"></div>
        <div class="status-badge" [ngClass]="status" *ngIf="!tooltip"></div>
    `,
})
export class QuickListItemStatusComponent {

    @Input()
    public tooltip: string;

    @Input()
    public status: QuickListItemStatus;
}
