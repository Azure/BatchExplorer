import {
    ChangeDetectorRef, Component, ContentChildren, Input, Optional, QueryList,
} from "@angular/core";

import { AbstractListBase } from "../abstract-list";
import { FocusSectionComponent } from "../focus-section";
import { QuickListItemComponent } from "./quick-list-item.component";

import "./quick-list.scss";

@Component({
    selector: "bl-quick-list",
    template: `
        <ng-content></ng-content>
    `,
})
export class QuickListComponent extends AbstractListBase {
    @ContentChildren(QuickListItemComponent)
    public items: QueryList<QuickListItemComponent>;

    constructor( @Optional() focusSection: FocusSectionComponent, changeDetection: ChangeDetectorRef) {
        super(changeDetection, focusSection);
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
export enum QuickListItemStatus {
    normal = "normal",
    warning = "warning",
    accent = "accent",
    lightaccent = "lightaccent",
    important = "important",
}

@Component({
    selector: "bl-quick-list-item-status",
    template: `
        <div class="status-badge" [ngClass]="status" *ngIf="tooltip" [matTooltip]="tooltip"></div>
        <div class="status-badge" [ngClass]="status" *ngIf="!tooltip"></div>
    `,
})
export class QuickListItemStatusComponent {
    @Input() public tooltip: string;

    @Input() public status: QuickListItemStatus;
}
