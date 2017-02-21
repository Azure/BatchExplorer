import { Component, Input } from "@angular/core";

import { ServerError } from "app/models";

interface ErrorData {
    message: string;
    requestId: string;
    time: string;
}

@Component({
    selector: "bl-server-error",
    templateUrl: "server-error.html",
})
export class ServerErrorComponent {

    @Input()
    public set error(error: ServerError) {
        if (error && !(error instanceof ServerError)) {
            console.error("Error passed to bl-server-error is not a server error.", error);
        }
        this._error = error;
        this.errorData = this.parseErrorData();
    }
    public get error() { return this._error; };

    public errorData: ErrorData;

    private _error: ServerError = null;

    public parseErrorData(): ErrorData {
        if (!this.error || !this.error.body.message) {
            return {
                message: null,
                requestId: null,
                time: null,
            };
        }
        const value = this.error.body.message;
        // Remove the request id from the the message
        const lines = value.split("\n");
        const message = lines.length > 0 ? lines[0] : null;
        const requestId = lines.length > 1 ? this._parseRequestDetails(lines[1]) : null;
        const time = lines.length > 2 ? this._parseRequestDetails(lines[2]) : null;

        return {
            message,
            requestId,
            time,
        };
    }

    private _parseRequestDetails(value: string): string {
        const data = value.split(":");
        data.shift();
        if (data.length > 1) {
            return data.join(":");
        } else {
            return data[0];
        }
    }
}
