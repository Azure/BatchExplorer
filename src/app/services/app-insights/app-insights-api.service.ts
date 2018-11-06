import { Location } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AccessToken, HttpInterface, HttpMethod, HttpRequestOptions, RetryableHttpCode, ServerError,
 } from "@batch-flask/core";
import { ArmBatchAccount } from "app/models";
import { AdalService } from "app/services/adal";
import { BatchExplorerService } from "app/services/batch-explorer.service";
import { Constants } from "common";
import { Observable, throwError, timer } from "rxjs";
import { catchError, mergeMap, retryWhen, share, switchMap, take, tap } from "rxjs/operators";
import { BatchAccountService } from "../batch-account";

function mergeOptions(original: HttpRequestOptions, body?: any): HttpRequestOptions {
    const options = original || {};
    if (body) {
        options.body = body;
    }

    return options;
}

@Injectable()
export class AppInsightsApiService implements HttpInterface {
    constructor(
        private http: HttpClient,
        private adal: AdalService,
        private accountService: BatchAccountService,
        private batchExplorer: BatchExplorerService) {
    }

    public get resourceUrl() {
        return this.batchExplorer.azureEnvironment.appInsights;
    }

    public get baseUrl() {
        return this.batchExplorer.azureEnvironment.appInsights + "v1/";
    }

    public request(
        method: HttpMethod,
        uri: string,
        options: HttpRequestOptions): Observable<any> {

        return this.accountService.currentAccount.pipe(
            take(1),
            tap((account) => {
                if (!(account instanceof ArmBatchAccount)) {
                    throw new ServerError({
                        code: "LocalBatchAccount",
                        message: "Cannot use APP INSIGHTS functionality with a local batch account",
                        status: 406,
                    });
                }
            }),
            switchMap((account: ArmBatchAccount) => {
                return this.adal.accessTokenData(account.subscription.tenantId, this.resourceUrl);
            }),
            switchMap((accessToken) => {
                options = this._setupRequestOptions(options, accessToken);
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

    public get<T>(uri: string, options?: HttpRequestOptions): Observable<T> {
        return this.request(HttpMethod.Get, uri, options);
    }

    public post<T>(uri: string, body?: any, options?: HttpRequestOptions): Observable<T> {
        return this.request(HttpMethod.Post, uri, mergeOptions(options, body));
    }

    public put<T>(uri: string, options?: HttpRequestOptions): Observable<T> {
        return this.request(HttpMethod.Put, uri, options);
    }

    public patch<T>(uri: string, body: any, options?: HttpRequestOptions): Observable<T> {
        return this.request(HttpMethod.Patch, uri, mergeOptions(options, body));
    }

    public delete<T>(uri: string, options?: HttpRequestOptions): Observable<T> {
        return this.request(HttpMethod.Delete, uri, options);
    }

    private _setupRequestOptions(
        options: HttpRequestOptions,
        accessToken: AccessToken): HttpRequestOptions {

        if (!(options.headers instanceof HttpHeaders)) {
            options.headers = new HttpHeaders(options.headers);
        }
        options.headers = options.headers.set("Authorization", `${accessToken.token_type} ${accessToken.access_token}`);

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
