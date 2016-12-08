import { Component, Input } from "@angular/core";

import { BatchError } from "app/models";

interface ErrorData {
    message: string;
    requestId: string;
    time: string;
}

@Component({
    selector: "bex-server-error",
    templateUrl: "./server-error.html",
})
export class ServerErrorComponent {

    @Input()
    public set error(error: BatchError) {
        this._error = error;
        this.errorData = this.parseErrorData();
    }
    public get error() { return this._error; };

    public errorData: ErrorData;

    private _error: BatchError = null;

    public parseErrorData(): ErrorData {
        if (!this.error || !this.error.message) {
            return null;
        }
        const value = this.error.message.value;
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
        const data = value.split(":", 2);
        if (data.length > 1) {
            return data[1];
        } else {
            return data[0];
        }
    }
}
