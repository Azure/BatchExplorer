import { Response } from "@angular/http";

import { BatchError } from "./batch-error";
import { JsonRpcError } from "./python-rpc";
import { StorageError } from "./storage-error";

interface ServerErrorAttributes {
    status: number;
    statusText?: string;
    body: ServerErrorBodyAttributes;
    original?: any;
}

interface ServerErrorBodyAttributes {
    code?: string;
    message?: string;
    requestId?: string;
    values?: any[];
    data?: any;
}

/**
 * Generic error structure for all api.
 * All their error format needs to be converted to this one so it can then be consumed easily
 */
export class ServerError {
    public static fromBatch(error: BatchError) {
        const body = {
            code: error.code,
            message: error.message && error.message.value,
            values: error.body && error.body.values,
        };

        return new ServerError({
            status: error.statusCode,
            body: body,
            original: error,
        });
    }

    public static fromStorage(error: StorageError) {
        const body = {
            code: error.code,
            message: error.message,
            requestId: error.requestId,
            values: null,
        };

        return new ServerError({
            status: error.statusCode,
            body: body,
            original: error,
        });
    }

    public static fromARM(response: Response): ServerError {
        const body = response.json();
        return new ServerError({
            status: response.status,
            statusText: response.statusText,
            body: body,
            original: response,
        });
    }

    public static fromPython(error: JsonRpcError) {
        console.log("Error is", error);
        const body = {
            code: error.data.code || ServerError._mapPythonErrorCode(error.code),
            message: error.message,
            values: error.data.values,
        };

        return new ServerError({
            status: error.data.status,
            body: body,
            original: error,
        });
    }

    private static _mapPythonErrorCode(code: number) {
        switch (code) {
            case -32602:
                return "InvalidParameterValue";
            case -32604:
                return "BatchClientError";
            default:
                return null;
        }
    }

    public status: number;
    public statusText: string;
    public body: ServerErrorBodyAttributes;
    public message: string;
    public original: any;

    constructor(attributes: ServerErrorAttributes) {
        Object.assign(this, attributes);

        const value = this.body.message;
        if (value) {
            // Remove the request id from the the message
            const lines = value.split("\n");

            this.message = lines.first();
        }
    }

    public toString() {
        return `${this.status} - ${this.body.message}`;
    }
}
