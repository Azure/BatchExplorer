import { HttpRequestMethod } from "./constants";

/**
 * Base class for HTTP clients
 */
export abstract class AbstractHttpClient implements HttpClient {
    abstract fetch(
        urlOrRequest: string | HttpRequest,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;

    get(
        urlOrRequest: string | HttpRequest,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse> {
        return AbstractHttpClient._fetchWithMethod(
            this,
            HttpRequestMethod.Get,
            urlOrRequest,
            requestProps
        );
    }

    post(
        urlOrRequest: string | HttpRequest,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse> {
        return AbstractHttpClient._fetchWithMethod(
            this,
            HttpRequestMethod.Post,
            urlOrRequest,
            requestProps
        );
    }

    put(
        urlOrRequest: string | HttpRequest,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse> {
        return AbstractHttpClient._fetchWithMethod(
            this,
            HttpRequestMethod.Put,
            urlOrRequest,
            requestProps
        );
    }

    delete(
        urlOrRequest: string | HttpRequest,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse> {
        return AbstractHttpClient._fetchWithMethod(
            this,
            HttpRequestMethod.Delete,
            urlOrRequest,
            requestProps
        );
    }

    patch(
        urlOrRequest: string | HttpRequest,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse> {
        return AbstractHttpClient._fetchWithMethod(
            this,
            HttpRequestMethod.Patch,
            urlOrRequest,
            requestProps
        );
    }

    private static _fetchWithMethod(
        client: HttpClient,
        method: string,
        urlOrRequest: string | HttpRequest,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse> {
        if (!requestProps) {
            requestProps = {};
        }
        requestProps.method = method;
        return client.fetch(urlOrRequest, requestProps);
    }
}

export abstract class AbstractHttpResponse implements HttpResponse {
    abstract get headers(): HttpHeaders;
    abstract get status(): number;
    abstract get url(): string;
    abstract text(): Promise<string>;

    get ok(): boolean {
        return this.status >= 200 && this.status < 300;
    }

    get redirected(): boolean {
        return this.status >= 300 && this.status < 400;
    }

    async json(): Promise<unknown> {
        const body = await this.text();
        return JSON.parse(body);
    }
}

/**
 * Generic HTTP client interface. Uses interfaces which are a subset of
 * the browser's Fetch API.
 */
export interface HttpClient {
    fetch(
        urlOrRequest: string | HttpRequest,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;
    get(
        urlOrRequest: string | HttpRequest,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;
    post(
        urlOrRequest: string | HttpRequest,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;
    put(
        urlOrRequest: string | HttpRequest,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;
    delete(
        urlOrRequest: string | HttpRequest,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;
    patch(
        urlOrRequest: string | HttpRequest,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;
}

export interface HttpRequest {
    readonly headers: HttpHeaders;
    readonly method: string;
    readonly url: string;
}

export interface HttpRequestInit {
    headers?: HttpHeaders | Record<string, string>;
    method?: string;
    url?: string;
}

export interface HttpResponse {
    readonly headers: HttpHeaders;
    readonly ok: boolean;
    readonly redirected: boolean;
    readonly status: number;
    readonly url: string;

    json(): Promise<unknown>;
    text(): Promise<string>;
}

export interface HttpHeaders {
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
    forEach(
        callback: (value: string, key: string, parent: HttpHeaders) => void,
        thisArg?: unknown
    ): void;
}
