import { Location } from "@angular/common";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    OnDestroy,
} from "@angular/core";
import { Activity, ActivityService, CurrentBrowserWindow, OSService } from "@batch-flask/ui";
import { AsyncSubject, BehaviorSubject, Subscription, of } from "rxjs";

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
        private changeDetector: ChangeDetectorRef,
        private activityService: ActivityService) {

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

    // TODO DELETE BEFORE PR
    public newFakeActivity() {
        const name = `Fake activity ${Math.floor(Math.random() * 1000)}`;
        const activity = new Activity(name, () => {
            return of([
                new Activity("fake child 1", () => {
                    const subj = new BehaviorSubject(null);
                    subj.error(new Error("Activity failed at entry point bravo charlie i am now jus writing words because i need to estimate the length it would take to get a line wrap on the activity montior if the activity error is too long to fit on one line which does happen every so often"));
                    return subj;
                }),
                new Activity("fake child 2", () => new AsyncSubject()),
            ]);
        });

        this.activityService.exec(activity);
    }
}
