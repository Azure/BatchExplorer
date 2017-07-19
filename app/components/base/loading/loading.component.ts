import {
    Component,
    Input,
    Optional,
    SkipSelf,
} from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { ServerError } from "app/models";
import "./loading.scss";

export enum LoadingStatus {
    Loading = 0,
    Ready = 1,
    Error = 2,
}

export enum DisplayStatus {
    Loading = 0,
    Ready = 1,
    Error = 2,
    ParentLoading = 3,
}

@Component({
    selector: "bl-loading",
    templateUrl: "loading.html",
})
export class LoadingComponent {
    public statuses = DisplayStatus;
    public displayStatus = new BehaviorSubject<DisplayStatus>(DisplayStatus.Loading);
    /**
     * If set to true the loading will only show the first time
     */
    @Input()
    public loadOnlyOnce = false;

    @Input()
    public size: "small" | "medium" | "large" = "large";

    @Input()
    public set status(value: LoadingStatus) {
        if (this.loadOnlyOnce && this._alreadyLoaded && value === LoadingStatus.Loading) {
            return;
        }

        this._status = value;
        this._updateDisplayStatus();
    }

    @Input()
    public error: ServerError;

    public get status() {
        return this._status;
    }

    private _status = LoadingStatus.Loading;
    private _parentDisplayStatus = DisplayStatus.Ready;
    private _alreadyLoaded = false;

    constructor( @SkipSelf() @Optional() private parentLoading: LoadingComponent) {
        // If this loading component is inside another loading component
        if (parentLoading) {
            this.parentLoading.displayStatus.subscribe((parentDisplayStatus) => {
                this._parentDisplayStatus = parentDisplayStatus;
                this._updateDisplayStatus();
            });
        }
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
