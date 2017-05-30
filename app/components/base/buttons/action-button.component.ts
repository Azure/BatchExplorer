import { Component, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output } from "@angular/core";

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
export class ActionButtonComponent implements OnChanges {
    @Output()
    public action = new EventEmitter();

    @HostBinding("tabindex")
    public tabindex = "0";

    @Input()
    public icon: string;

    @Input()
    public title: string;

    @Input()
    @HostBinding("class.disabled")
    public disabled = false;

    @Input()
    @HostBinding("attr.type")
    public type: ButtonType = "normal";

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
            this.handleAction();
            event.preventDefault();
        }
    }

    public ngOnChanges(changes) {
        if ("disabled" in changes) {
            this.tabindex = this.disabled ? "-1" : "0";
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
