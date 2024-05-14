import { normalizeUrl } from "../util/url";
import { HttpRequestMethod } from "./constants";
import {
    AbstractHttpClient,
    AbstractHttpResponse,
    HttpHeaders,
    HttpRequestInit,
    HttpResponse,
} from "./http-client";
import { MapHttpHeaders } from "./map-http-headers";

/**
 * Mock implementation of an HTTP client which throws an exception if an
 * unexpected request is made.
 */
export class MockHttpClient extends AbstractHttpClient {
    private _expectedResponses: Record<string, MockHttpResponse[]> = {};
    private _expectedRequestBodies: Record<
        string,
        { refCount: number; bodyId: string }
    > = {};
    private _bodyIdCounter = 0;

    async fetch(
        urlOrRequest: string | HttpRequestInit,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse> {
        const props = requestProps ?? {};
        let url: string;
        if (typeof urlOrRequest === "string") {
            url = urlOrRequest;
        } else {
            if (!urlOrRequest.url) {
                throw new Error("Fetch failed: Must specify a URL");
            }
            url = urlOrRequest.url;
        }
        url = normalizeUrl(url);

        const key = this._getKeyFromRequest(url, props);
        const expected = this._expectedResponses[key];
        if (expected && expected.length > 0) {
            const response = expected.shift();
            if (!response) {
                throw new MockHttpResponseError(
                    `Expected response was null or undefined: ${key}`
                );
            }
            if (expected.length === 0) {
                delete this._expectedResponses[key];
            }
            if (
                props.body &&
                typeof props.body === "string" &&
                this._expectedRequestBodies[props.body]
            ) {
                const expectedBody = this._expectedRequestBodies[props.body];
                expectedBody.refCount--;
                if (expectedBody.refCount === 0) {
                    // Nothing references this request body anymore so we can clear it
                    delete this._expectedRequestBodies[props.body];
                }
            }
            return response;
        }

        const expectedKeys = Object.keys(this._expectedResponses);
        let expectedMessage: string;
        if (expectedKeys.length > 0) {
            expectedMessage = `Expected one of:\n${expectedKeys.join("\n")}`;
        } else {
            expectedMessage = "There are no more expected requests.";
        }
        throw new MockHttpResponseError(
            `Unexpected mock request: ${key}. ${expectedMessage}`
        );
    }

    /**
     * Pushes an expected response with optional request properties onto the
     * stack.
     *
     * @param response The expected response
     * @param requestProps Expected request properties such as headers or method
     */
    addExpected(
        response: MockHttpResponse,
        requestProps: HttpRequestInit = {}
    ): MockHttpClient {
        const key = this._getKeyFromRequest(
            requestProps.url ?? response.url,
            requestProps,
            true
        );
        const expected = this._expectedResponses[key] ?? [];
        expected.push(response);
        this._expectedResponses[key] = expected;
        return this;
    }

    private _getKeyFromRequest(
        url: string,
        requestProps: HttpRequestInit,
        // If true, allow storing bodies for future retreival
        updateBodyIds: boolean = false
    ): string {
        const method = requestProps.method ?? HttpRequestMethod.Get;

        let bodyId: string = "";
        if (requestProps.body) {
            const bodyString = this.serializeBody(requestProps.body);
            if (this._expectedRequestBodies[bodyString]) {
                // Existing body identifier
                const expectedBody = this._expectedRequestBodies[bodyString];
                if (updateBodyIds) {
                    expectedBody.refCount++;
                }
                bodyId = expectedBody.bodyId;
            } else if (updateBodyIds) {
                // New body identifier
                bodyId = `body${this._bodyIdCounter++}`;
                this._expectedRequestBodies[bodyString] = {
                    refCount: 1,
                    bodyId: bodyId,
                };
            } else {
                throw new Error(`Unexpected request body: ${bodyString}`);
            }
        }

        if (bodyId !== "") {
            return `${method}::${url}::${bodyId}`;
        } else {
            return `${method}::${url}`;
        }
    }

    remainingAssertions(): string[] {
        return Object.keys(this._expectedResponses).map(
            (key) => key.split("::")[1]
        );
    }

    serializeBody(
        body: string | Blob | BufferSource | FormData | URLSearchParams
    ): string {
        if (typeof body === "string") {
            return body;
        } else if (body instanceof URLSearchParams) {
            return body.toString();
        }
        throw new Error(
            "Unsupported request body type: MockHttpClient supports bodies of type string or URLSearchParams"
        );
    }
}

/**
 * Mock HTTP response object used for testing
 */
export class MockHttpResponse extends AbstractHttpResponse {
    private _headers: HttpHeaders;
    private _status: number;
    private _url: string;
    private _body: string;

    protected streamConsumed: boolean = false;

    get headers(): HttpHeaders {
        return this._headers;
    }

    get status(): number {
        return this._status;
    }

    get url(): string {
        return this._url;
    }

    constructor(
        url: string,
        opts?: {
            status?: number;
            body?: string;
            headers?: HttpHeaders | Record<string, string>;
        }
    ) {
        super();
        this._url = url;
        this._status = opts?.status ?? 200;
        this._body = opts?.body ?? "";
        this._headers = new MapHttpHeaders(opts?.headers);
    }

    async text(): Promise<string> {
        if (this.streamConsumed) {
            // Since some real implementations (ie: fetch) don't allow
            // the response body to be read twice, we need to throw
            // an exception here too.
            throw new TypeError(
                "Failed to get response text: body stream already read"
            );
        }
        this.streamConsumed = true;
        return this._body;
    }
}

/**
 * Mock HTTP response error
 */
export class MockHttpResponseError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
