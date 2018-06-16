import { Location } from "@angular/common";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    OnDestroy,
} from "@angular/core";
import { CurrentBrowserWindow, OSService } from "@batch-flask/ui";
import { Subscription } from "rxjs";

import "./header.scss";

@Component({
    selector: "bl-header",
    templateUrl: "header.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnDestroy {
    @HostBinding("class.skip-osx-buttons")
    public get skipOsxButtons() {
        return this._isOsx && !this._fullScreen;
    }

    private _isOsx = false;
    private _fullScreen = false;
    private _sub: Subscription;

    constructor(
        private location: Location,
        window: CurrentBrowserWindow,
        os: OSService,
        private changeDetector: ChangeDetectorRef) {

        this._isOsx = os.isOSX();
        this._sub = window.fullScreen.subscribe((fullScreen) => {
            this._fullScreen = fullScreen;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public goBack() {
        this.location.back();
    }

    public goForward() {
        this.location.forward();
    }
}
