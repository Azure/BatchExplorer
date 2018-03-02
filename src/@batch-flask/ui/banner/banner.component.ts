import {
    ChangeDetectorRef, Component, ContentChildren, Directive, Input, OnChanges, QueryList,
} from "@angular/core";
import { Observable, Subscription } from "rxjs";

export enum ErrorState {
    Error,
    Fixing,
    Fixed,
}

export enum BannerType {
    error = "error",
    warning = "warning",
    notice = "notice",
}

import "./banner.scss";

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: "[other-fix]",
})
export class BannerOtherFixDirective {
    @Input() public fixMessage: string;

    // tslint:disable-next-line:no-input-rename
    @Input("other-fix") public fix: () => Observable<any>;
}

/**
 * Banner to be used in the detail section for warning and error.
 * - Summary for quick view
 * - Detail content that is hidden by default
 */
@Component({
    selector: "bl-banner",
    templateUrl: "banner.html",
    // TODO-Change-Detection This require updating all the ng-content
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerComponent implements OnChanges {
    public errorStates = ErrorState;

    /**
     * Use this to give an unique id to a banner so if you component change above the banner will reset.
     */
    @Input() public id: string;

    @Input() public message: string;

    @Input() public fixMessage: string;

    @Input() public fix: () => Observable<any>;

    @Input() public type = BannerType.error;

    @Input() public height: string = "standard";

    @ContentChildren(BannerOtherFixDirective)
    public otherFixes: QueryList<BannerOtherFixDirective>;

    public showDetails = false;

    public state = ErrorState.Error;

    public showOtherFixes = false;

    /**
     * Subscription when listening to the fixing method observable
     */
    private _fixingSub: Subscription;

    constructor(private changeDetector: ChangeDetectorRef) { }
    public ngOnChanges(inputs) {
        this.state = ErrorState.Error;
        if (this._fixingSub) {
            this._fixingSub.unsubscribe();
        }
    }

    public triggerFix(otherFix?: BannerOtherFixDirective) {
        this.showOtherFixes = false;
        this.state = ErrorState.Fixing;
        this.changeDetector.markForCheck();

        const fixMethod = otherFix ? otherFix.fix : this.fix;
        const fixObs = fixMethod();
        if (fixObs) {
            this._fixingSub = fixObs.subscribe(() => {
                this._markFixed();
            });
        } else {
            this._markFixed();
        }
    }

    public trackByFn(index, item: BannerOtherFixDirective) {
        return index;
    }

    private _markFixed() {
        this.state = ErrorState.Fixed;
        this.changeDetector.markForCheck();

        setTimeout(() => {
            this.state = ErrorState.Error;
            this.changeDetector.markForCheck();
        }, 1000);
    }
}
