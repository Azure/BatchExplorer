import { Response } from "@angular/http";

import { HttpErrorResponse } from "@angular/common/http";
import { exists, log } from "@batch-flask/utils";
import { BatchError } from "./batch-error";
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
    public static fromBatchHttp(response: HttpErrorResponse) {
        const error = response.error;
        const { message, requestId, timestamp } = parseMessage(error.message && error.message.value);

        // when the error message returned is not of type ErrorMessage, it will more often
        // than not be a string.
        return new ServerError({
            status: error.statusCode,
            code: error.code,
            details: error.body && error.body.values,
            message: message || error.message as string,
            requestId,
            timestamp,
            original: error,
        });
    }

    public static fromBatch(error: BatchError) {
        const { message, requestId, timestamp } = parseMessage(error.message && error.message.value);

        // when the error message returned is not of type ErrorMessage, it will more often
        // than not be a string.
        return new ServerError({
            status: error.statusCode,
            code: error.code,
            details: error.body && error.body.values,
            message: message || error.message as string,
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

    public static fromPython(error) {
        const { message, requestId, timestamp } = parseMessage(error.message);

        let details;
        if (error.data) {
            if (Array.isArray(error.data)) {
                details = error.data;
            } else if (typeof (error.data) === "string") {
                details = [{ key: "Description", value: error.data }];
            } else if (error.values) {
                details = error.values;
            } else {
                log.error("Unknown Python server error format");
            }
        }
        return new ServerError({
            status: error.data && error.data.status,
            code: ServerError._mapPythonErrorCode(error.code),
            message: message,
            details,
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

    public static fromAADGraph(response: HttpErrorResponse): ServerError {
        const error = response.error["odata.error"];
        let requestId = null;
        const timestamp = null;
        let code = null;
        let message = null;
        let details = null;
        if (error) {
            code = error.code;
            message = error.message && error.message.value;
            requestId = error.requestId;
            details = error.values && error.values.map((x) => {
                return { key: x.item, value: x.value };
            });
        }
        return new ServerError({
            status: response.status,
            code: code,
            statusText: response.statusText,
            original: response,
            message: message,
            requestId,
            timestamp,
            details,
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
        return [this.status, this.statusText, this.message].filter(x => exists(x)).join(" - ") + this.detailsToString();
    }

    public detailsToString() {
        return this.details.map(({key, value}) => {
            return `${key}: ${value}`;
        }).join("\n");
    }
}
