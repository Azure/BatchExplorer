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
    statusText?: string | null;
    code?: string | null;
    message: string;
    details?: ErrorDetail[] | null;
    requestId?: string | null;
    timestamp?: Date | null;
    original?: any | null;
}

function parseValueFromLine(line: string): string | null {
    if (!line) { return null; }
    const data = line.split(":");
    data.shift();
    if (data.length > 1) {
        return data.join(":");
    } else {
        return data[0];
    }
}

function parseRequestIdFromLine(line: string): string | null {
    return parseValueFromLine(line);
}

function parseTimestampFromLine(line: string): Date | null {
    const timeStr = parseValueFromLine(line);
    if (!timeStr) { return null; }
    return new Date(timeStr);
}

function parseMessage(fullMessage: string | null | undefined) {
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
    public static fromBatchBody(error: any) {
        const { message, requestId, timestamp } = parseMessage(error.message && error.message.value);

        // when the error message returned is not of type ErrorMessage, it will more often
        // than not be a string.
        return new ServerError({
            status: error.statusCode,
            code: error.code,
            details: error.values,
            message: message || error.message as string,
            requestId,
            timestamp,
            original: error,
        });
    }

    public static fromBatchHttp(response: HttpErrorResponse) {
        const error = response.error || {};
        const { message, requestId, timestamp } = parseMessage(error.message && error.message.value);

        // when the error message returned is not of type ErrorMessage, it will more often
        // than not be a string.
        return new ServerError({
            status: response.status,
            statusText: response.statusText,
            code: error.code,
            details: error.values,
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
        if (error instanceof ServerError) {
            return error;
        }
        const { message, timestamp } = parseMessage(error.message);

        return new ServerError({
            status: error.statusCode,
            original: error,
            code: error.code,
            message: message || "",
            requestId: error.requestId,
            timestamp,
        });
    }

    public static fromARM(response: HttpErrorResponse): ServerError {
        // KLUDGE: Angular's request nests the error inside an error object
        let error;
        if (response.error?.error) {
            error = response.error.error;
        } else {
            error = response.error;
        }
        error = error || {};
        let requestId: string | null = null;
        let timestamp: Date | null = null;
        const code = error.code;
        const message = error.message;

        if (response.headers) {
            requestId = response.headers.get("x-ms-request-id");
            const date = response.headers.get("Date");
            timestamp = date ? new Date(date) : null;
        }

        return new ServerError({
            status: response.status,
            code: code,
            statusText: response.statusText,
            original: response,
            message: message || "",
            requestId,
            timestamp,
        });
    }

    public static fromMsGraph(response: HttpErrorResponse): ServerError {
        const { error } = response.error;
        let requestId = null;
        let timestamp: Date | null = null;
        let code = null;
        let message: string | null = null;

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
            message: message || "",
            requestId,
            timestamp,
        });
    }

    public status: number;
    public statusText: string | null | undefined;
    public code: string | null | undefined;
    public message: string;
    public details: ErrorDetail[];
    public requestId: string | null | undefined;
    public timestamp: Date | null | undefined;
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
        return this.details.map(({ key, value }) => {
            return `${key}: ${value}`;
        }).join("\n");
    }
}
