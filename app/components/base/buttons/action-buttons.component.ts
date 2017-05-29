import { Component, Input } from "@angular/core";

import "./action-buttons.scss";

type ButtonType = "normal" | "round";
type ButtonColor = "primary" | "danger" | "warn";

@Component({
    selector: "bl-action-btn",
    template: `
        <button class="action-btn" [attr.type]="type" [attr.color]="color" [mdTooltip]="title"
            [disabled]="disabled" mdTooltipPosition="right">
            <i [class]="icon"></i>
            <ng-content></ng-content>
        </button>
    `,
})
export class ActionButtonComponent {
    @Input()
    public icon: string;

    @Input()
    public title: string;

    @Input()
    public disabled = false;

    @Input()
    public type: ButtonType;

    @Input()
    public color: ButtonColor = "primary";
}

@Component({
    selector: "bl-action-btn-group",
    template: `
        <ng-content></ng-content>
    `,
})
export class ActionButtonGroupComponent {
}
