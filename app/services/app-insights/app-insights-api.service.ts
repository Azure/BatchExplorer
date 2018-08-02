import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { Headers, Http, RequestMethod, RequestOptions, RequestOptionsArgs, Response } from "@angular/http";
import { Observable } from "rxjs";

import { AccessToken, RetryableHttpCode, ServerError } from "@batch-flask/core";
import { AccountService } from "app/services/account.service";
import { AdalService } from "app/services/adal";
import { BatchExplorerService } from "app/services/batch-labs.service";
import { Constants } from "app/utils";

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
        private accountService: AccountService,
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

        return this.accountService.currentAccount.take(1)
            .flatMap((account) => this.adal.accessTokenData(account.subscription.tenantId, this.resourceUrl))
            .flatMap((accessToken) => {
                options = this._setupRequestOptions(uri, options, accessToken);
                return this.http.request(this._computeUrl(uri), options)
                    .retryWhen(attempts => this._retryWhen(attempts))
                    .catch((error) => {
                        const err = ServerError.fromARM(error);
                        return Observable.throw(err);
                    });
            }).share();
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
        uri: string,
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
        const retryRange = Observable.range(0, Constants.badHttpCodeMaxRetryCount + 1);
        return attempts
            .switchMap((x: any) => {
                if (RetryableHttpCode.has(x.status)) {
                    return of(x);
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
