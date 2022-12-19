import { HttpRequestMethod } from "./constants";

export type UrlOrRequestInit = string | HttpRequestInit;

/**
 * Base class for HTTP clients
 */
export abstract class AbstractHttpClient implements HttpClient {
    abstract fetch(
        urlOrRequest: UrlOrRequestInit,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;

    get(
        urlOrRequest: UrlOrRequestInit,
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
        urlOrRequest: UrlOrRequestInit,
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
        urlOrRequest: UrlOrRequestInit,
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
        urlOrRequest: UrlOrRequestInit,
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
        urlOrRequest: UrlOrRequestInit,
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
        urlOrRequest: UrlOrRequestInit,
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

    async blob(): Promise<Blob> {
        const body = await this.text();
        return new Blob([body], {
            type: this.headers.get("Content-Type") ?? undefined,
        });
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
        const body = await this.blob();
        return body.arrayBuffer();
    }
}

/**
 * Generic HTTP client interface. Uses interfaces which are a subset of
 * the browser's Fetch API.
 */
export interface HttpClient {
    fetch(
        urlOrRequest: UrlOrRequestInit,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;
    get(
        urlOrRequest: UrlOrRequestInit,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;
    post(
        urlOrRequest: UrlOrRequestInit,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;
    put(
        urlOrRequest: UrlOrRequestInit,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;
    delete(
        urlOrRequest: UrlOrRequestInit,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;
    patch(
        urlOrRequest: UrlOrRequestInit,
        requestProps?: HttpRequestInit
    ): Promise<HttpResponse>;
}

export interface HttpRequestInit {
    body?: Blob | ArrayBuffer | ArrayBufferView | string;
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

    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
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
