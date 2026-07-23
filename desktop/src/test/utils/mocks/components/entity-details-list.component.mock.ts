import { Component, Input } from "@angular/core";

@Component({
    standalone: false,
    selector: "bl-entity-details-list",
    template: `
        <button title="{{addButtonHoverText}}"></button>
        <ng-content select="[bl-list-buttons]"></ng-content>
        <ng-content></ng-content>
    `,
})
export class EntityDetailsListMockComponent {
    @Input()
    public addButtonHoverText: string = "Add";
}
