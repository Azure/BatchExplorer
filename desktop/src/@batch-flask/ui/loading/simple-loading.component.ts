import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription, interval } from "rxjs";

/**
 * Loading showing a simple loading text.
 */
@Component({
    selector: "bl-simple-loading",
    template: `{{message}}`,
})
export class SimpleLoadingComponent implements OnInit, OnDestroy {
    @Input() public rate = 500;

    public message = "";
    private _sub: Subscription;

    public ngOnInit() {
        this._sub = interval(this.rate).subscribe((i) => {
            const dots = ".".repeat(i % 4);
            this.message = `Loading${dots}`;
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }
}
