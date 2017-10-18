/**
 * Wrap options for all batch calls to add custom headers.
 * @param options Options
 */
import { Constants } from "../../../client-constants";
import { BatchResult } from "../models";

export function wrapOptions<T>(options?: T): T {
    const newOptions: any = options || {};
    if (!newOptions.customHeaders) {
        newOptions.customHeaders = {};
    }
    newOptions.customHeaders["User-Agent"] = `BatchLabs/${Constants.version}`;
    newOptions.customHeaders["Origin"] = `https://localhost`;
    newOptions.customHeaders["Host"] = `management.azure.com`;
    newOptions.customHeaders["Access-Control-Request-Headers"] = "Content-Length";
    newOptions.customHeaders["x-ms-client-request-id"] = "faf40371-2c5a-4998-bbf2-51d3d80d7010";
    newOptions.customHeaders["x-ms-client-session-id"] = "9014548e0a114486961125dc0b8d8a9f";
    return newOptions;
}

export function mapGet(promise: Promise<any>): Promise<BatchResult> {
    return promise.then((data) => {
        return { data };
    });
}
