import { animate, style, transition, trigger } from "@angular/animations";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    Injector,
    Input,
} from "@angular/core";
import { Observable } from "rxjs";

import { log } from "@batch-flask/utils";

import "./button.scss";
import { ClickableComponent } from "./clickable";

export type ButtonType = "square" | "round" | "wide" | "plain";
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
export class ButtonComponent extends ClickableComponent {
    public SubmitStatus = SubmitStatus;

    @Input() public action: ButtonAction;
    @Input() public icon: string;
    @Input() public title: string;
    @Input() public tooltipPosition: string = "above";

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
    public get tooltipTitle() { return `${this.title || ""}${this.subtitle || ""}`; }

    private _status = SubmitStatus.Idle;

    constructor(
        injector: Injector,
        private changeDetectionRef: ChangeDetectorRef) {
        super(injector);
    }

    public handleAction(event: Event) {
        super.handleAction(event);
        if (this.isDisabled || !this.action) {
            return;
        }
        this._execute(event);
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
