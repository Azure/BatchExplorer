import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";

/**
 * Loading showing a simple loading text.
 */
@Component({
    selector: "bl-simple-loading",
    template: `{{message}}`,
})
export class SimpleLoadingComponent implements OnInit {
    @Input()
    public rate = 500;

    public message = "";

    public ngOnInit() {
        Observable.interval(this.rate).subscribe((i) => {
            const dots = ".".repeat(i % 4);
            this.message = `Loading${dots}`;
        });
    }
}
