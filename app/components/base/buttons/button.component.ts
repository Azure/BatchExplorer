import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding,
    Input, OnChanges, SimpleChanges, animate, style, transition, trigger,
} from "@angular/core";
import { Observable } from "rxjs";

import { log } from "app/utils";
import "./button.scss";
import { ClickableComponent } from "./clickable";

export type ButtonType = "square" | "round" | "wide";
export type ButtonColor = "primary" | "light" | "danger" | "warn" | "success";
export type ButtonAction = (event?: Event) => Observable<any> | void;

export enum SubmitStatus {
    Idle,
    Submitting,
    Succeeded,
    Failed,
}

@Component({
    selector: "bl-button",
    templateUrl: "button.html",
    animations: [
        trigger("animateSucessIcon", [
            transition(":enter", [
                style({ width: 0 }),
                animate("200ms", style({ width: "1em" })),
            ]),
        ]),
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ButtonComponent extends ClickableComponent implements OnChanges {
    public SubmitStatus = SubmitStatus;

    @Input() public action: ButtonAction;
    @Input() public icon: string;
    @Input() public title: string;
    @Input() public tooltipPosition: string = "right";

    /**
     * If set to true the check mark animation will not be shown
     */
    @Input() public skipSuccess: boolean = false;
    @Input() @HostBinding("attr.type") public type: ButtonType = "square";
    @Input() @HostBinding("attr.color") public color: ButtonColor = "primary";
    @Input() public routerLink: string;

    public set status(value: SubmitStatus) {
        this._status = value;
        this.changeDetectionRef.markForCheck();
    }

    public get status() { return this._status; }
    private _status = SubmitStatus.Idle;

    constructor(private changeDetectionRef: ChangeDetectorRef) {
        super();
    }

    public handleAction(event: Event) {
        super.handleAction(event);
        if (this.disabled || !this.action) {
            return;
        }
        this._execute(event);
    }

    public ngOnChanges(changes: SimpleChanges) {
        if ("disabled" in changes) {
            this.tabindex = this.disabled ? "-1" : "0";
        }
    }

    public done() {
        setTimeout(() => {
            this.status = SubmitStatus.Idle;
        }, 700);
    }

    private _execute(event: Event) {
        this.status = SubmitStatus.Submitting;

        const obs = this.action(event);
        if (!obs) {
            if (this.skipSuccess) {
                this.status = SubmitStatus.Idle;
            } else {
                this.status = SubmitStatus.Succeeded;
                this.done();
            }
            return;
        }
        obs.subscribe({
            complete: () => {
                this.status = SubmitStatus.Succeeded;
                this.done();
            },
            error: (e) => {
                log.error("Error while executing button action", e);
                this.status = SubmitStatus.Failed;
                this.done();
            },
        });
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
