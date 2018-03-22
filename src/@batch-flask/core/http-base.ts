import { Location } from "@angular/common";
import { HttpEvent, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { RetryableHttpCode } from "@batch-flask/core/constants";
import { UrlUtils } from "@batch-flask/utils";
import { Observable } from "rxjs";
import { AccessToken } from "./aad/access-token";

export const badHttpCodeMaxRetryCount = 5;

export type HttpRequestObservable = "body" | "events" | "response";

export interface HttpRequestOptions<T extends HttpRequestObservable = "body"> {
    body?: any;
    headers?: HttpHeaders | {
        [header: string]: string | string[];
    };
    reportProgress?: boolean;
    observe?: T;
    params?: HttpParams | {
        [param: string]: string | string[];
    };
    responseType?: "json";
    withCredentials?: boolean;
}

/**
 * abstract class for a http warpper service
 * This use angular 5 HttpClient
 */
export abstract class HttpService {
    public abstract get serviceUrl();

    public abstract request<T>(
        method: string,
        uri: string,
        options: HttpRequestOptions<"events">): Observable<HttpEvent<T>>;
    public abstract request<T>(
        method: string,
        uri: string,
        options: HttpRequestOptions<"response">): Observable<HttpResponse<T>>;
    public abstract request<T>(method: string, uri: string, options?: HttpRequestOptions): Observable<T>;

    public get<T>(uri: string, options: HttpRequestOptions<"events">): Observable<HttpEvent<T>>;
    public get<T>(uri: string, options: HttpRequestOptions<"response">): Observable<HttpResponse<T>>;
    public get<T>(uri: string, options?: HttpRequestOptions): Observable<T>;
    public get<T>(uri: string, options?: any) {
        return this.request<T>("get", uri, options);
    }

    public post<T>(uri: string, body: any, options: HttpRequestOptions<"events">): Observable<HttpEvent<T>>;
    public post<T>(uri: string, body: any, options: HttpRequestOptions<"response">): Observable<HttpResponse<T>>;
    public post<T>(uri: string, body: any, options?: HttpRequestOptions): Observable<T>;
    public post(uri: string, body?: any, options?: any) {
        return this.request("post", uri, { body, ...options });
    }

    public patch<T>(uri: string, body: any, options: HttpRequestOptions<"events">): Observable<HttpEvent<T>>;
    public patch<T>(uri: string, body: any, options: HttpRequestOptions<"response">): Observable<HttpResponse<T>>;
    public patch<T>(uri: string, body: any, options?: HttpRequestOptions): Observable<T>;
    public patch(uri: string, body?: any, options?: any) {
        return this.request("patch", uri, { body, ...options });
    }

    public put<T>(uri: string, body: any, options: HttpRequestOptions<"events">): Observable<HttpEvent<T>>;
    public put<T>(uri: string, body: any, options: HttpRequestOptions<"response">): Observable<HttpResponse<T>>;
    public put<T>(uri: string, body: any, options?: HttpRequestOptions): Observable<T>;
    public put(uri: string, body?: any, options?: any) {
        return this.request("put", uri, { body, ...options });
    }

    public delete<T>(uri: string, options: HttpRequestOptions<"events">): Observable<HttpEvent<T>>;
    public delete<T>(uri: string, options: HttpRequestOptions<"response">): Observable<HttpResponse<T>>;
    public delete<T>(uri: string, options?: HttpRequestOptions): Observable<T>;
    public delete(uri: string, options?: any) {
        return this.request("delete", uri, options);
    }

    protected retryWhen(attempts: Observable<Response>) {
        const retryRange = Observable.range(0, badHttpCodeMaxRetryCount + 1);
        return attempts
            .switchMap((x: any) => {
                if (RetryableHttpCode.has(x.status)) {
                    return Observable.of(x);
                }
                return Observable.throw(x);
            })
            .zip(retryRange, (attempt, retryCount) => {
                if (retryCount >= badHttpCodeMaxRetryCount) {
                    throw attempt;
                }
                return retryCount;
            })
            .flatMap((retryCount) => {
                return Observable.timer(100 * Math.pow(3, retryCount));
            });
    }

    protected computeUrl(uri: string) {
        if (UrlUtils.isHttpUrl(uri)) {
            return uri;
        } else {
            return Location.joinWithSlash(this.serviceUrl, uri);
        }
    }

    protected addAuthorizationHeader(
        originalOptions: HttpRequestOptions,
        accessToken: AccessToken): HttpRequestOptions {

        const options = { ...originalOptions };
        if (!(options.headers instanceof HttpHeaders)) {
            options.headers = new HttpHeaders(options.headers);
        }
        options.headers = options.headers.set("Authorization", `${accessToken.token_type} ${accessToken.access_token}`);
        return options;
    }
}
