import { PipelineRequest, PipelineResponse } from "@azure/core-rest-pipeline";

/**
 * The options supported by RestError.
 */
export interface RestErrorOptions {
    /**
     * The code of the error itself (use statics on RestError if possible.)
     */
    code?: string;
    /**
     * The HTTP status code of the request (if applicable.)
     */
    statusCode?: number;
    /**
     * The request that was made.
     */
    request?: PipelineRequest;
    /**
     * The response received (if any.)
     */
    response?: PipelineResponse;
}

export class RestError extends Error {
    /**
     * Something went wrong when making the request.
     * This means the actual request failed for some reason,
     * such as a DNS issue or the connection being lost.
     */
    static readonly REQUEST_SEND_ERROR: string = "REQUEST_SEND_ERROR";
    /**
     * The code of the error itself (use statics on RestError if possible.)
     */
    public code?: string;
    /**
     * The HTTP status code of the request (if applicable.)
     */
    public statusCode?: number;
    /**
     * The request that was made.
     */
    public request?: PipelineRequest;
    /**
     * The response received (if any.)
     */
    public response?: PipelineResponse;

    constructor(message: string, options: RestErrorOptions = {}) {
        super(message);
        this.name = "RestError";
        this.code = options.code;
        this.statusCode = options.statusCode;
        this.request = options.request;
        this.response = options.response;
    }
}
