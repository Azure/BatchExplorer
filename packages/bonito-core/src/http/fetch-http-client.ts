import { normalizeUrl } from "../util/url";
import { CustomHttpHeaders } from "./constants";
import { AbstractHttpClient, HttpRequestInit } from "./http-client";

/**
 * An HTTP client which is a thin wrapper around the browser's Fetch API.
 * Can take in browser-native Request objects and always returns a native
 * Response object.
 */
export class FetchHttpClient extends AbstractHttpClient {
    async fetch(
        urlOrRequest: string | HttpRequestInit,
        requestProps?: HttpRequestInit
    ): Promise<Response> {
        let url: string;
        let req: HttpRequestInit | undefined;
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
        url = normalizeUrl(url);

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

            const commandName = req.metadata?.commandName;
            if (commandName) {
                if (!headers) {
                    headers = new Headers({
                        [CustomHttpHeaders.CommandName]: commandName,
                    });
                } else {
                    headers.set(CustomHttpHeaders.CommandName, commandName);
                }
            }

            responsePromise = fetch(url, {
                method: req.method,
                headers: headers,
                body: req.body,
            });
        }

        return responsePromise;
    }
}
