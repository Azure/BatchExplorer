import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";

import { ErrorDetail, ServerError } from "@batch-flask/core";
import { log } from "@batch-flask/utils";

import "./server-error.scss";

@Component({
    selector: "bl-server-error",
    templateUrl: "server-error.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerErrorComponent {

    @Input()
    public set error(error: ServerError) {
        if (error && !(error instanceof ServerError)) {
            log.error("Error passed to bl-server-error is not a server error.", error);
        }
        this._error = error;
    }
    public get error() { return this._error; }

    public showDebugInformation = false;
    private _error: ServerError = null;

    constructor(private changeDetector: ChangeDetectorRef) { }

    public toggleDebugInformation() {
        this.showDebugInformation = !this.showDebugInformation;
        this.changeDetector.markForCheck();
    }

    public trackDetail(index, detail: ErrorDetail) {
        return detail.key;
    }
}
