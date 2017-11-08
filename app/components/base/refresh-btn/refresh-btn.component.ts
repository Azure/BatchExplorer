import { Component, Input, animate, style, transition, trigger } from "@angular/core";
import { autobind } from "core-decorators";
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
})
export class RefreshButtonComponent {
    public statuses = RefreshStatus;

    @Input()
    public refresh: () => Observable<any>;

    @Input()
    public type: string = "square";

    @Input()
    public tooltipPosition: string = "above";

    public status = RefreshStatus.Idle;

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
