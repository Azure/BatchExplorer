import { Component, Input, animate, style, transition, trigger } from "@angular/core";
import { Observable } from "rxjs";

export enum RefreshStatus {
    Idle,
    Refreshing,
    Succeeded,
    Failed,
}

@Component({
    selector: "bex-refresh-btn",
    template: require("./refresh-btn.html"),
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

    public status = RefreshStatus.Idle;

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
            }
        );
    }
}
