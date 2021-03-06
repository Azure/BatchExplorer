import {
    AbstractHttpClient,
    HttpRequest,
    HttpRequestInit,
} from "./http-client";

/**
 * An HTTP client which is a thin wrapper around the browser's Fetch API.
 * Can take in browser-native Request objects and always returns a native
 * Response object.
 */
export class FetchHttpClient extends AbstractHttpClient {
    async fetch(
        urlOrRequest: string | HttpRequest | Request,
        requestProps?: HttpRequestInit
    ): Promise<Response> {
        if (!urlOrRequest) {
            throw new Error("Fetch failed: At least one argument is required");
        }

        let url: string;
        let req: HttpRequestInit | HttpRequest | undefined;
        if (typeof urlOrRequest === "string") {
            url = urlOrRequest;
            if (requestProps) {
                req = requestProps;
                if (requestProps.url) {
                    throw new Error("Fetch failed: Cannot specify two URLs");
                }
            }
        } else {
            req = urlOrRequest;
            if (!req.url) {
                throw new Error("Fetch failed: Must specify a URL");
            }
            url = req.url;
        }

        let responsePromise: Promise<Response>;
        if (!req) {
            responsePromise = fetch(url);
        } else {
            // Build standard Fetch request object
            let headers: Headers | undefined = undefined;
            if (req.headers) {
                const headersInit: HeadersInit = {};
                if (typeof req.headers.forEach === "function") {
                    // Headers object
                    req.headers.forEach((value, key) => {
                        headersInit[key] = value;
                    });
                } else {
                    // Map of headers
                    const headerMap = req.headers as Record<string, string>;
                    for (const [k, v] of Object.entries(headerMap)) {
                        headersInit[k] = v;
                    }
                }
                headers = new Headers(headersInit);
            }

            responsePromise = fetch(
                new Request(url, {
                    method: req.method,
                    headers: headers ?? undefined,
                })
            );
        }

        return responsePromise;
    }
}
