import { Response } from "@angular/http";

import { HttpErrorResponse } from "@angular/common/http";
import { BatchError } from "./batch-error";
import { JsonRpcError } from "./python-rpc";
import { StorageError } from "./storage-error";

export interface ErrorDetail {
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

function parseValueFromLine(line: string): string {
    if (!line) { return null; }
    const data = line.split(":");
    data.shift();
    if (data.length > 1) {
        return data.join(":");
    } else {
        return data[0];
    }
}

function parseRequestIdFromLine(line: string): string {
    return parseValueFromLine(line);
}

function parseTimestampFromLine(line: string): Date {
    const timeStr = parseValueFromLine(line);
    if (!timeStr) { return null; }
    return new Date(timeStr);
}

function parseMessage(fullMessage: string) {
    if (!fullMessage) {
        return { message: null, requestId: null, timestamp: null };
    }
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
        const { message, timestamp } = parseMessage(error.message);

        return new ServerError({
            status: error.statusCode,
            original: error,
            code: error.code,
            message: message,
            requestId: error.requestId,
            timestamp,
        });
    }

    public static fromARM(response: Response): ServerError {
        const { error } = response.json();
        let requestId = null;
        let timestamp = null;
        let code = null;
        let message = null;

        if (response.headers) {
            requestId = response.headers.get("x-ms-request-id");
            const date = response.headers.get("Date");
            timestamp = date && new Date(date);
        }

        if (error) {
            code = error.code;
            message = error.message;
        }
        return new ServerError({
            status: response.status,
            code: code,
            statusText: response.statusText,
            original: response,
            message: message,
            requestId,
            timestamp,
        });
    }

    public static fromPython(error: JsonRpcError) {
        const { message, requestId, timestamp } = parseMessage(error.message);

        return new ServerError({
            status: error.data && error.data.status,
            code: ServerError._mapPythonErrorCode(error.code),
            message: message,
            details: error.data && error.data.values,
            original: error,
            requestId,
            timestamp,
        });
    }

    public static fromMsGraph(response: HttpErrorResponse): ServerError {
        const { error } = response.error;
        let requestId = null;
        let timestamp = null;
        let code = null;
        let message = null;

        if (error.innerError) {
            requestId = error.innerError["request-id"];
            const date = error.innerError["date"];
            timestamp = date && new Date(date);
        }

        if (error) {
            code = error.code;
            message = error.message;
        }
        return new ServerError({
            status: response.status,
            code: code,
            statusText: response.statusText,
            original: response,
            message: message,
            requestId,
            timestamp,
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
