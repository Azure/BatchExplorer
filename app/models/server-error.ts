import { Response } from "@angular/http";
import { BatchError } from "./batchError";

interface ServerErrorAttributes {
    status: number;
    statusText?: string;
    body: ServerErrorBodyAttributes;
    original: any;
}

interface ServerErrorBodyAttributes {
    code?: string;
    message?: string;
    values?: any[];
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

    public static fromARM(response: Response): ServerError {
        const body = response.json();
        return new ServerError({
            status: response.status,
            statusText: response.statusText,
            body: body,
            original: response,
        });
    }

    public status: number;
    public statusText: string;
    public body: ServerErrorBodyAttributes;

    constructor(attributes: ServerErrorAttributes) {
        Object.assign(this, attributes);
    }

}
