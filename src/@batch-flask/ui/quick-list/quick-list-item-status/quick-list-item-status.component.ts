import { Component, Input } from "@angular/core";

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
