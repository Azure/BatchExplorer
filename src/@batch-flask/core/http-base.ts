import { Location } from "@angular/common";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { RetryableHttpCode } from "@batch-flask/core/constants";
import { UrlUtils } from "@batch-flask/utils";
import { Observable, of, range, throwError, timer } from "rxjs";
import { flatMap, switchMap, zip } from "rxjs/operators";
import { AccessToken } from "./aad/access-token";

export const badHttpCodeMaxRetryCount = 5;

export type HttpResponseType = "arraybuffer" | "blob" | "json" | "text";
export type HttpObserve = "body" | "events" | "response";

export interface HttpRequestOptions<O extends HttpObserve = "body", R extends HttpResponseType = "json"> {
    body?: any;
    headers?: HttpHeaders | { [header: string]: string | string[] };
    observe?: O;
    params?: HttpParams | { [param: string]: string | string[] };
    reportProgress?: boolean;
    responseType?: R;
    withCredentials?: boolean;
}

export enum HttpMethod {
    Get = "GET",
    Post = "POST",
    Patch = "PATCH",
    Head = "HEAD",
    Put = "PUT",
    Delete = "DELETE",
}

/**
 * abstract class for a http warpper service
 * This use angular 5 HttpClient
 */
export abstract class HttpService extends HttpClient {
    public abstract get serviceUrl();

    protected retryWhen(attempts: Observable<Response>) {
        const retryRange = range(0, badHttpCodeMaxRetryCount + 1);
        return attempts.pipe(
            switchMap((x: any) => {
                if (RetryableHttpCode.has(x.status)) {
                    return of(x);
                }
                return throwError(x);
            }),
            zip(retryRange, (attempt, retryCount) => {
                if (retryCount >= badHttpCodeMaxRetryCount) {
                    throw attempt;
                }
                return retryCount;
            }),
            flatMap((retryCount) => {
                return timer(100 * Math.pow(3, retryCount));
            }),
        );
    }

    protected computeUrl(uri: string) {
        if (UrlUtils.isHttpUrl(uri)) {
            return uri;
        } else {
            return Location.joinWithSlash(this.serviceUrl, uri);
        }
    }

    protected addAuthorizationHeader(
        originalOptions: HttpRequestOptions<any, any>,
        accessToken: AccessToken): HttpRequestOptions<any, any> {

        const options = { ...originalOptions };
        if (!(options.headers instanceof HttpHeaders)) {
            options.headers = new HttpHeaders(options.headers);
        }
        options.headers = options.headers.set("Authorization", `${accessToken.token_type} ${accessToken.access_token}`);
        return options;
    }
}

export interface HttpInterface {
    get<T>(uri: string, options?: HttpRequestOptions): Observable<T>;

    post<T>(uri: string, body?: any, options?: HttpRequestOptions): Observable<T>;

    put<T>(uri: string, options?: HttpRequestOptions): Observable<T>;

    patch<T>(uri: string, body: any, options?: HttpRequestOptions): Observable<T>;

    delete<T>(uri: string, options?: HttpRequestOptions): Observable<T>;
}
