import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
    selector: "bl-node-home",
    templateUrl: "node-home.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeHomeComponent implements OnInit, OnDestroy {
    public poolId: string;

    private _paramsSubscriber: Subscription;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private activatedRoute: ActivatedRoute) {
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.poolId = params["poolId"];
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        if (this._paramsSubscriber) {
            this._paramsSubscriber.unsubscribe();
        }
    }
}
