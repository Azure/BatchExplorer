import { Component, HostBinding, HostListener, Input, OnChanges, SimpleChanges } from "@angular/core";
import { Observable } from "rxjs";

import "./button.scss";

export type ButtonType = "normal" | "round" | "wide";
export type ButtonColor = "primary" | "danger" | "warn";
export type ButtonAction = () => Observable<any> | void;

@Component({
    selector: "bl-button",
    template: `
        <span class="action-btn" [ngClass]="type" [mdTooltip]="title" mdTooltipPosition="right">
            <i [class]="icon"></i>
            <ng-content></ng-content>
        </span>
    `,
})
export class ButtonComponent implements OnChanges {
    @Input()
    public action: ButtonAction;

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
        this.action();
    }

    @HostListener("keydown", ["$event"])
    public onkeydown(event: KeyboardEvent) {
        if (event.code === "Space" || event.code === "Enter") {
            this.handleAction();
            event.preventDefault();
        }
    }

    public ngOnChanges(changes: SimpleChanges) {
        if ("disabled" in changes) {
            this.tabindex = this.disabled ? "-1" : "0";
        }

        if (changes.action) {
            if (!changes.action.currentValue) {
                throw new Error(`Action for bl-button with title '${this.title}' cannot be null or undefined`);
            }
        }
    }
}

@Component({
    selector: "bl-button-group",
    template: `
        <ng-content></ng-content>
    `,
})
export class ButtonGroupComponent {
}
