import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";

export enum ErrorState {
    Error,
    Fixing,
    Fixed,
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

    public showDetails = false;

    public state = ErrorState.Error;

    public triggerFix() {
        this.state = ErrorState.Fixing;
        this.fix().subscribe(() => {
            this.state = ErrorState.Fixed;
        });
    }
}
