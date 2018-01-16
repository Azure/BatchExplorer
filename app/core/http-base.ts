import { HttpEvent, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { Constants } from "common";

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

    public post<T>(uri: string, options: HttpRequestOptions<"events">): Observable<HttpEvent<T>>;
    public post<T>(uri: string, options: HttpRequestOptions<"response">): Observable<HttpResponse<T>>;
    public post<T>(uri: string, options?: HttpRequestOptions): Observable<T>;
    public post(uri: string, options?: any) {
        return this.request("post", uri, options);
    }

    public patch<T>(uri: string, options: HttpRequestOptions<"events">): Observable<HttpEvent<T>>;
    public patch<T>(uri: string, options: HttpRequestOptions<"response">): Observable<HttpResponse<T>>;
    public patch<T>(uri: string, options?: HttpRequestOptions): Observable<T>;
    public patch(uri: string, options?: any) {
        return this.request("patch", uri, options);
    }

    public put<T>(uri: string, options: HttpRequestOptions<"events">): Observable<HttpEvent<T>>;
    public put<T>(uri: string, options: HttpRequestOptions<"response">): Observable<HttpResponse<T>>;
    public put<T>(uri: string, options?: HttpRequestOptions): Observable<T>;
    public put(uri: string, options?: any) {
        return this.request("put", uri, options);
    }

    public delete<T>(uri: string, options: HttpRequestOptions<"events">): Observable<HttpEvent<T>>;
    public delete<T>(uri: string, options: HttpRequestOptions<"response">): Observable<HttpResponse<T>>;
    public delete<T>(uri: string, options?: HttpRequestOptions): Observable<T>;
    public delete(uri: string, options?: any) {
        return this.request("delete", uri, options);
    }

    protected retryWhen(attempts: Observable<Response>) {
        const retryRange = Observable.range(0, Constants.badHttpCodeMaxRetryCount + 1);
        return attempts
            .switchMap((x: any) => {
                if (Constants.RetryableHttpCode.has(x.status)) {
                    return Observable.of(x);
                }
                return Observable.throw(x);
            })
            .zip(retryRange, (attempt, retryCount) => {
                if (retryCount >= Constants.badHttpCodeMaxRetryCount) {
                    throw attempt;
                }
                return retryCount;
            })
            .flatMap((retryCount) => {
                return Observable.timer(100 * Math.pow(3, retryCount));
            });
    }
}
