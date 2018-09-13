import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { Headers, Http, RequestMethod, RequestOptions, RequestOptionsArgs, Response } from "@angular/http";
import { AccessToken, RetryableHttpCode, ServerError } from "@batch-flask/core";
import { ArmBatchAccount } from "app/models";
import { AdalService } from "app/services/adal";
import { Constants } from "app/utils";
import { Observable, throwError, timer } from "rxjs";
import { catchError, flatMap, mergeMap, retryWhen, share, take, tap } from "rxjs/operators";
import { BatchAccountService } from "../batch-account";
import { BatchExplorerService } from "app/services/batch-explorer.service";

function mergeOptions(original: RequestOptionsArgs, method: RequestMethod, body?: any): RequestOptionsArgs {
    const options = original || new RequestOptions();
    options.method = method;
    if (body) {
        options.body = body;
    }

    return options;
}

@Injectable()
export class AppInsightsApiService {
    constructor(
        private http: Http,
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
        uri: string,
        options: RequestOptionsArgs): Observable<Response> {

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
            flatMap((account: ArmBatchAccount) => {
                return this.adal.accessTokenData(account.subscription.tenantId, this.resourceUrl);
            }),
            flatMap((accessToken) => {
                options = this._setupRequestOptions(options, accessToken);
                return this.http.request(this._computeUrl(uri), options).pipe(
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

    public get(uri: string, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Get));
    }

    public post(uri: string, body?: any, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Post, body));
    }

    public put(uri: string, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Put));
    }

    public patch(uri: string, body: any, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Patch, body));
    }

    public delete(uri: string, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Delete));
    }

    private _setupRequestOptions(
        originalOptions: RequestOptionsArgs,
        accessToken: AccessToken): RequestOptionsArgs {

        const options = new RequestOptions(originalOptions);
        options.headers = new Headers(originalOptions.headers);
        options.headers.append("Authorization", `${accessToken.token_type} ${accessToken.access_token}`);

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
