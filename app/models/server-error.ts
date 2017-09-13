import { Response } from "@angular/http";

import { BatchError } from "./batch-error";
import { PythonPRpcError } from "./python-rpc-error";
import { StorageError } from "./storage-error";

interface ErrorDetail {
    key?: string;
    value?: string;
}

interface ServerErrorAttributes {
    status: number;
    statusText?: string;
    code: string;
    message: string;
    details?: ErrorDetail[];
    requestId?: string;
    timestamp?: Date;
    original?: any;
}

function parseRequestIdFromLine(line: string): string {
    if (!line) { return null; }
    return line.split(":")[1];
}

function parseTimestampFromLine(line: string): Date {
    if (!line) { return null; }
    const timeStr = line.split(":")[1];
    if (!timeStr) { return null; }
    return new Date(timeStr);
}

function parseMessage(fullMessage: string) {
    const lines = fullMessage.split("\n");
    const message = lines[0];
    const requestId = parseRequestIdFromLine(lines[1]);
    const timestamp = parseTimestampFromLine(lines[2]);
    return {
        message,
        requestId,
        timestamp,
    };
}
/**
 * Generic error structure for all api.
 * All their error format needs to be converted to this one so it can then be consumed easily
 */
export class ServerError {
    public static fromBatch(error: BatchError) {
        const { message, requestId, timestamp } = parseMessage(error.message && error.message.value);

        return new ServerError({
            status: error.statusCode,
            code: error.code,
            details: error.body && error.body.values,
            message,
            requestId,
            timestamp,
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
        const { error } = response.json();
        let requestId = null;
        let timestamp = null;

        if (response.headers) {
            requestId = response.headers.get("x-ms-request-id");
            const date = response.headers.get("Date");
            timestamp = date && new Date(date);
        }

        return new ServerError({
            status: response.status,
            code: error.code,
            statusText: response.statusText,
            original: response,
            message: error.message,
            requestId,
            timestamp,
        });
    }

    public static fromPython(error: PythonPRpcError) {
        const { message, requestId, timestamp } = parseMessage(error.message);

        return new ServerError({
            status: error.data && error.data.status,
            code: ServerError._mapPythonErrorCode(error.code),
            message,
            details: error.data,
            requestId,
            timestamp,
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
    public code: string;
    public message: string;
    public details: ErrorDetail[];
    public requestId: string;
    public timestamp: Date;
    public original: any;

    constructor(attributes: ServerErrorAttributes) {
        this.status = attributes.status;
        this.statusText = attributes.statusText;
        this.code = attributes.code;
        this.message = attributes.message;
        this.details = attributes.details || [];
        this.requestId = attributes.requestId;
        this.timestamp = attributes.timestamp;
        this.original = attributes.original;
    }

    public toString() {
        return `${this.status} - ${this.message}`;
    }
}
