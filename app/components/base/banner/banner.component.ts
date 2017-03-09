import { Component, ContentChildren, Directive, Input, QueryList } from "@angular/core";
import { Observable } from "rxjs";

export enum ErrorState {
    Error,
    Fixing,
    Fixed,
}

export type BannerType = "error" | "warning";
export const BannerType = {
    error: "error" as BannerType,
    warning: "warning" as BannerType,
};

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: "[other-fix]",
})
export class BannerOtherFixDirective {
    @Input()
    public fixMessage: string;

    // tslint:disable-next-line:no-input-rename
    @Input("other-fix")
    public fix: () => Observable<any>;
}

/**
 * Banner to be used in the detail section for warning and error.
 * - Summary for quick view
 * - Detail content that is hidden by default
 */
@Component({
    selector: "bl-banner",
    templateUrl: "banner.html",
})
export class BannerComponent {
    public errorStates = ErrorState;

    /**
     * Use this to give an unique id to a banner so if you component change above the banner will reset.
     */
    @Input()
    public id: string;

    @Input()
    public fixMessage: string;

    @Input()
    public fix: () => Observable<any>;

    @Input()
    public type = BannerType.error;

    @ContentChildren(BannerOtherFixDirective)
    public otherFixes: QueryList<BannerOtherFixDirective>;

    public showDetails = false;

    public state = ErrorState.Error;

    public showOtherFixes = false;

    public ngOnChanges(inputs) {
        console.log("Changed", inputs);
        this.state = ErrorState.Error;
    }

    public triggerFix(otherFix?: BannerOtherFixDirective) {
        this.showOtherFixes = false;
        this.state = ErrorState.Fixing;
        const fixMethod = otherFix ? otherFix.fix : this.fix;
        const fixObs = fixMethod();
        if (fixObs) {
            fixObs.subscribe(() => {
                this._markFixed();
            });
        } else {
            this._markFixed();
        }
    }

    private _markFixed() {
        this.state = ErrorState.Fixed;
        setTimeout(() => {
            this.state = ErrorState.Error;
        }, 1000);
    }
}
