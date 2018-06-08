import { animate, style, transition, trigger } from "@angular/animations"
import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input,
} from "@angular/core";
import { autobind } from "@batch-flask/core";
import { Observable } from "rxjs";

export enum RefreshStatus {
    Idle,
    Refreshing,
    Succeeded,
    Failed,
}

@Component({
    selector: "bl-refresh-btn",
    templateUrl: "refresh-btn.html",
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
export class RefreshButtonComponent {
    public statuses = RefreshStatus;

    @Input() public refresh: () => Observable<any>;

    @Input() public type: string = "square";

    @Input() public tooltipPosition: string = "above";

    public set status(status: RefreshStatus) {
        this._status = status;
        this.changeDetector.markForCheck();
    }

    public get status() { return this._status; }

    private _status = RefreshStatus.Idle;

    constructor(private changeDetector: ChangeDetectorRef) {
    }

    @autobind()
    public onClick() {
        this.status = RefreshStatus.Refreshing;
        this.refresh().subscribe(
            () => {
                this.status = RefreshStatus.Succeeded;
                setTimeout(() => {
                    this.status = RefreshStatus.Idle;
                }, 500);
            },
            () => {
                this.status = RefreshStatus.Failed;
                setTimeout(() => {
                    this.status = RefreshStatus.Idle;
                }, 1000);
            },
        );
    }
}
