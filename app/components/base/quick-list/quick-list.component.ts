import {
    Component, ContentChildren, EventEmitter,  Input, Optional, Output, QueryList,
} from "@angular/core";

import { FocusSectionComponent } from "../focus-section";
import { ActivatedItemChangeEvent, SelectableListBase } from "../selectable-list/selectable-list-base";
import { QuickListItemComponent } from "./quick-list-item.component";

@Component({
    selector: "bex-quick-list",
    template: `
        <ng-content></ng-content>
    `,
})
export class QuickListComponent extends SelectableListBase {
    @ContentChildren(QuickListItemComponent)
    public items: QueryList<QuickListItemComponent>;

    @Output()
    public selectedItemsChange = new EventEmitter<string[]>();

    /**
     * Event when the activated item(With the route) change. Send the item key.
     */
    @Output()
    public activatedItemChange = new EventEmitter<ActivatedItemChangeEvent>();

    @Input()
    public selectedItems: string[];

    constructor(@Optional() focusSection: FocusSectionComponent) {
        super(focusSection);
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
    selector: "bex-quick-list-item-status",
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
