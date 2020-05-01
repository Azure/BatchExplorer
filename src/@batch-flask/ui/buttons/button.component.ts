import { animate, style, transition, trigger } from "@angular/animations";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    HostListener,
    Injector,
    Input,
    Optional,
    Self,
    ViewChild,
} from "@angular/core";
import { MatTooltip } from "@angular/material/tooltip";
import { RouterLink } from "@angular/router";
import { log } from "@batch-flask/utils";
import { Observable, isObservable } from "rxjs";
import { ClickableComponent } from "./clickable";

import "./button.scss";

export type ButtonType = "square" | "round" | "wide" | "plain";
export type ButtonColor = "primary" | "light" | "danger" | "warn" | "success";
export type ButtonAction = (event?: Event) => Observable<any> | void;

export enum SubmitStatus {
    Idle,
    Submitting,
    Succeeded,
    Failed,
}

let idCounter = 0;

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

    public set status(value: SubmitStatus) {
        this._status = value;
        this.changeDetectionRef.markForCheck();
    }

    public get status() { return this._status; }
    public get tooltipTitle() { return `${this.title || ""}${this.subtitle || ""}`; }
    public SubmitStatus = SubmitStatus;

    @Input() public id = `bl-button-${idCounter++}`;
    @Input() public action: ButtonAction;
    @Input() public icon: string;
    @Input() public title: string;
    @Input() public tooltipPosition: string = "above";
    // tslint:disable-next-line:no-input-rename
    @Input("attr.aria-describedby") public userAriaDescribedBy: string;

    /**
     * If set to true the check mark animation will not be shown
     */
    @Input() public skipSuccess: boolean = false;
    @Input() @HostBinding("attr.type") public type: ButtonType = "square";
    @Input() @HostBinding("attr.color") public color: ButtonColor = "primary";
    @Input() @HostBinding("attr.aria-label") public get ariaLabel() {
        if (this.type === "square" || this.type === "plain") {
            return this.title;
        }
    }

    @ViewChild(MatTooltip, { static: false }) private _tooltip: MatTooltip;

    private _status = SubmitStatus.Idle;

    constructor(
        injector: Injector,
        @Self() @Optional() routerLink: RouterLink,
        private changeDetectionRef: ChangeDetectorRef) {
        super(injector, routerLink);
    }

    // Aria
    // @HostBinding("attr.aria-label") public get ariaLabel() { return this.title; }
    @HostBinding("attr.aria-describedby") public get ariaDescribedBy() {
        const tooltipDescribe = this.type === "plain" || this.type === "square" ? "" : `${this.id}-described`;
        const userDescribe = this.userAriaDescribedBy || "";

        return `${tooltipDescribe} ${userDescribe}`;
    }

    public handleAction(event: Event) {
        super.handleAction(event);
        if (this.isDisabled || !this.action) {
            return;
        }
        this._execute(event);
    }

    @HostListener("focus")
    public showTooltip() {
        this._tooltip.show(100);
    }

    @HostListener("blur")
    public hideTooltip() {
        this._tooltip.hide();
    }

    public done() {
        setTimeout(() => {
            this.status = SubmitStatus.Idle;
        }, 700);
    }

    private _execute(event: Event) {
        this.status = SubmitStatus.Submitting;

        const obs = this.action(event);
        if (!isObservable(obs)) {
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
