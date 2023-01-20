import {
    Component,
    ElementRef,
    Input,
    OnDestroy,
    Optional,
    SkipSelf,
    ViewChild,
} from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { DisplayStatus, LoadingStatus } from "./loading-status";

import "./loading.scss";

@Component({
    selector: "bl-loading",
    templateUrl: "loading.html",
})
export class LoadingComponent implements OnDestroy {
    @ViewChild("ref", { static: false })
    public loadingContent: ElementRef;

    /**
     * If set to true the loading will only show the first time
     */
    @Input() public loadOnlyOnce = false;

    @Input() public size: "small" | "medium" | "large" = "large";

    public get status() {
        return this._status;
    }

    @Input() public set status(value: LoadingStatus) {
        if (this.loadOnlyOnce && this._alreadyLoaded && value === LoadingStatus.Loading) {
            return;
        }

        this._status = value;
        this._updateDisplayStatus();
    }

    @Input() public error: ServerError;
    @Input() public relative: boolean = false;

    public statuses = DisplayStatus;
    public displayStatus = new BehaviorSubject<DisplayStatus>(DisplayStatus.Loading);

    private _status = LoadingStatus.Loading;
    private _parentDisplayStatus = DisplayStatus.Ready;
    private _alreadyLoaded = false;
    private _parentSub: Subscription;

    constructor(@SkipSelf() @Optional() private parentLoading: LoadingComponent) {
        // If this loading component is inside another loading component
        if (parentLoading) {
            this._parentSub = this.parentLoading.displayStatus.subscribe((parentDisplayStatus) => {
                this._parentDisplayStatus = parentDisplayStatus;
                this._updateDisplayStatus();
            });
        }
    }

    public ngOnDestroy() {
        if (this._parentSub) {
            this._parentSub.unsubscribe();
        }
        this.displayStatus.complete();
    }

    private _updateDisplayStatus() {
        const parentDisplayStatus = this._parentDisplayStatus;
        if (parentDisplayStatus === DisplayStatus.Loading || parentDisplayStatus === DisplayStatus.ParentLoading) {
            this.displayStatus.next(DisplayStatus.ParentLoading);
        } else {
            this.displayStatus.next(this._status as any);
        }
    }
}
