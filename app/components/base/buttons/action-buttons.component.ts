import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from "@angular/core";

import "./action-buttons.scss";

type ButtonType = "normal" | "round";
type ButtonColor = "primary" | "danger" | "warn";

@Component({
    selector: "bl-action-btn",
    template: `
        <span class="action-btn" [mdTooltip]="title" mdTooltipPosition="right">
            <i [class]="icon"></i>
            <ng-content></ng-content>
        </span>
    `,
})
export class ActionButtonComponent {
    @Output()
    public action = new EventEmitter();

    @HostBinding("tabindex")
    public tabindex = "0";

    @Input()
    public icon: string;

    @Input()
    public title: string;

    @Input()
    public disabled = false;

    @Input()
    @HostBinding("attr.type")
    public type: ButtonType;

    @Input()
    @HostBinding("attr.color")
    public color: ButtonColor = "primary";

    @Input()
    public routerLink: string;

    @HostListener("click")
    public handleAction() {
        if (this.disabled) {
            return;
        }
        this.action.emit();
    }

    @HostListener("keydown", ["$event"])
    public onkeydown(event: KeyboardEvent) {
        if (event.code === "Space" || event.code === "Enter") {
            console.log("Event", event);
            this.handleAction();
            event.preventDefault();
        }
    }
}

@Component({
    selector: "bl-action-btn-group",
    template: `
        <ng-content></ng-content>
    `,
})
export class ActionButtonGroupComponent {
}
