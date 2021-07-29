import { animate, style, transition, trigger } from "@angular/animations";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy,
} from "@angular/core";
import { autobind } from "@batch-flask/core";
import { Observable, Subscription } from "rxjs";

import "./refresh-btn.scss";

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
export class RefreshButtonComponent implements OnDestroy {
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
    private _refreshSub: Subscription;

    constructor(private changeDetector: ChangeDetectorRef, private liveAnnouncer: LiveAnnouncer) {
    }

    public ngOnDestroy() {
        if (this._refreshSub) {
            this._refreshSub.unsubscribe();
        }
    }

    @autobind()
    public onClick() {
        this.status = RefreshStatus.Refreshing;
        this.liveAnnouncer.announce("Refreshing in progress");
        this._refreshSub = this.refresh().subscribe(
            () => {
                this.status = RefreshStatus.Succeeded;
                this.liveAnnouncer.announce("Refreshed");
                this.changeDetector.markForCheck();
                setTimeout(() => {
                    this.status = RefreshStatus.Idle;
                    this.changeDetector.markForCheck();
                }, 500);
            },
            () => {
                this.status = RefreshStatus.Failed;
                this.liveAnnouncer.announce("Refresh failed");
                this.changeDetector.markForCheck();

                setTimeout(() => {
                    this.status = RefreshStatus.Idle;
                    this.changeDetector.markForCheck();
                }, 1000);
            },
        );
    }

}
