import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, animate, style, transition, trigger,
} from "@angular/core";
import { Observable } from "rxjs";

export enum SubmitStatus {
    Idle,
    Submitting,
    Succeeded,
    Failed,
}

@Component({
    selector: "bex-submit-btn",
    templateUrl: "./submit-btn.html",
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
export class SubmitButtonComponent {
    public statuses = SubmitStatus;

    @Input()
    public color: string = "primary";

    @Input()
    public submit: () => Observable<any>;

    @Input()
    public disabled = false;

    @Input()
    public multiSubmit = true;

    public set status(value: SubmitStatus) {
        this._status = value;
        this.changeDetectionRef.markForCheck();
    }

    public get status() { return this._status; }
    private _status = SubmitStatus.Idle;

    constructor(private changeDetectionRef: ChangeDetectorRef) {

    }

    public onClick() {
        this.status = SubmitStatus.Submitting;

        const submit = this.submit();
        if (!submit) {
            this.status = SubmitStatus.Succeeded;
            this.done();
            return;
        }
        submit.subscribe({
            complete: () => {
                this.status = SubmitStatus.Succeeded;
                this.done();
            },
            error: () => {
                this.status = SubmitStatus.Failed;
                this.done();
            },
        });
    }

    public done() {
        if (this.multiSubmit) {
            setTimeout(() => {
                this.status = SubmitStatus.Idle;
            }, 500);
        }
    }
}
