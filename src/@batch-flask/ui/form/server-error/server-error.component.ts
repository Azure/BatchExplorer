import { Component, Input } from "@angular/core";

import { ErrorDetail, ServerError } from "@batch-flask/core";
import { log } from "@batch-flask/utils";

@Component({
    selector: "bl-server-error",
    templateUrl: "server-error.html",
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

    private _error: ServerError = null;

    public trackDetail(index, detail: ErrorDetail) {
        return detail.key;
    }
}
