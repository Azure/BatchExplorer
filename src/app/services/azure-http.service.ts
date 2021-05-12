import { Location } from "@angular/common";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AccessToken, HttpRequestOptions, RetryableHttpCode, ServerError } from "@batch-flask/core";
import { ArmSubscription } from "app/models";
import { ArmResourceUtils } from "app/utils";
import { Constants } from "common";
import { Observable, throwError, timer } from "rxjs";
import { catchError, mergeMap, retryWhen, share, switchMap } from "rxjs/operators";
import { AdalService } from "./adal";
import { BatchExplorerService } from "./batch-explorer.service";

function mergeOptions(original: HttpRequestOptions, body?: any): HttpRequestOptions {
    const options = original || {};
    if (body) {
        options.body = body;
    }

    return options;
}

type SubscriptionOrTenant = ArmSubscription | string;

export class InvalidSubscriptionOrTenant extends Error {
    constructor(message: string) {
        super(message);
    }
}

/**
 * Wrapper around the http service so call the azure ARM api.
 * Set the Authorization header and the api version
 */
@Injectable({ providedIn: "root" })
export class AzureHttpService {
    constructor(private http: HttpClient, private adal: AdalService, private batchExplorer: BatchExplorerService) {
    }

    public request(
        method: string,
        subscriptionOrTenant: SubscriptionOrTenant,
        uri: string,
        options: HttpRequestOptions): Observable<any> {
        return this.adal.accessTokenData(this._getTenantId(subscriptionOrTenant, uri)).pipe(
            switchMap((accessToken) => {
                options = this._setupRequestOptions(uri, options, accessToken);
                return this.http.request(method, this._computeUrl(uri), options).pipe(
                    retryWhen(attempts => this._retryWhen(attempts)),
                    catchError((error) => {
                        const err = ServerError.fromARM(error);
                        return throwError(err);
                    }),
                );
            }),
            share(),
        );

    }

    public get baseUrl() {
        return this.batchExplorer.azureEnvironment.arm;
    }

    public get<T>(subscription: SubscriptionOrTenant, uri: string, options?: HttpRequestOptions): Observable<T> {
        return this.request("GET", subscription, uri, options);
    }

    public post<T>(subscription: SubscriptionOrTenant, uri: string, body?: any, options?: HttpRequestOptions)
        : Observable<T> {

        return this.request("POST", subscription, uri, mergeOptions(options, body));
    }

    public put<T>(subscription: SubscriptionOrTenant, uri: string, options?: HttpRequestOptions): Observable<T> {
        return this.request("PUT", subscription, uri, options);
    }

    public patch<T>(subscription: SubscriptionOrTenant, uri: string, body: any, options?: HttpRequestOptions)
        : Observable<T> {
        return this.request("PATCH", subscription, uri, mergeOptions(options, body));
    }

    public delete<T>(subscription: ArmSubscription, uri: string, options?: HttpRequestOptions): Observable<T> {
        return this.request("DELETE", subscription, uri, options);
    }

    private _getTenantId(subscriptionOrTenant: SubscriptionOrTenant, uri: string): string {
        if (subscriptionOrTenant instanceof ArmSubscription) {
            return subscriptionOrTenant.tenantId;
        } else if (typeof subscriptionOrTenant === "string") {
            return subscriptionOrTenant;
        } else {
            throw new InvalidSubscriptionOrTenant(`Invalid param in azure http service for uri "${uri}". `
                + `Expected Subscription or tenant id but got ${subscriptionOrTenant}`);
        }
    }

    private _setupRequestOptions(
        uri: string,
        originalOptions: HttpRequestOptions,
        accessToken: AccessToken): HttpRequestOptions {

        const options = { ...originalOptions };
        if (!(options.headers instanceof HttpHeaders)) {
            options.headers = new HttpHeaders(options.headers);
        }
        options.headers = options.headers.set("Authorization", `${accessToken.token_type} ${accessToken.access_token}`);

        if (!(options.params instanceof HttpParams)) {
            options.params = new HttpParams({ fromObject: options.params });
        }

        if (!options.params.has("api-version") && !uri.contains("api-version")) {
            options.params = options.params.set("api-version", ArmResourceUtils.getApiVersionForUri(uri));
        }
        return options;
    }

    private _computeUrl(uri: string): string {
        if (/^https?:\/\//i.test(uri)) {
            return uri;
        } else {
            return Location.joinWithSlash(this.baseUrl, uri);
        }
    }

    private _retryWhen(attempts: Observable<Response>) {
        return attempts.pipe(
            mergeMap((error, i) => {
                const retryAttempt = i + 1;
                // if maximum number of retries have been met
                // or response is a status code we don't wish to retry, throw error
                if (
                    retryAttempt > Constants.badHttpCodeMaxRetryCount ||
                    !RetryableHttpCode.has(error.status)
                ) {
                    return throwError(error);
                }
                // retry after 1s, 2s, etc...
                return timer(100 * Math.pow(3, retryAttempt));
            }),
        );
    }
}
