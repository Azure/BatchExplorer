import { Component, ContentChildren, Directive, Input, QueryList } from "@angular/core";
import { Observable } from "rxjs";

export enum ErrorState {
    Error,
    Fixing,
    Fixed,
}

@Directive({
    selector: "[other-fix]",
})
export class BannerOtherFixDirective {
    @Input()
    public fixMessage: string;

    @Input()
    public fix: () => Observable<any>;
}

/**
 * Banner to be used in the detail section for warning and error.
 * - Summary for quick view
 * - Detail content that is hidden by default
 */
@Component({
    selector: "bex-banner",
    templateUrl: "./banner.html",
})
export class BannerComponent {
    public errorStates = ErrorState;

    @Input()
    public fixMessage: string;

    @Input()
    public fix: () => Observable<any>;

    @ContentChildren(BannerOtherFixDirective)
    public otherFixes: QueryList<BannerOtherFixDirective>;

    public showDetails = false;

    public state = ErrorState.Error;

    public showOtherFixes = false;

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

