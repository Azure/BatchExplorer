import { Location } from "@angular/common";
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { AccountService } from "app/services/account.service";
import { AdalService } from "app/services/adal";
import { AccessToken } from "client/core/aad/access-token";
import { AADUser } from "client/core/aad/adal/aad-user";
import { Constants } from "common";

export interface HttpRequestOptions {
    body?: any;
    headers?: HttpHeaders | {
        [header: string]: string | string[];
    };
    reportProgress?: boolean;
    observe?: "events";
    params?: HttpParams | {
        [param: string]: string | string[];
    };
    responseType?: "json";
    withCredentials?: boolean;
}

/**
 * Class wrapping around the http service to call Microsoft Graph api
 */
@Injectable()
export class MsGraphHttpService {
    private _currentUser: AADUser;
    constructor(private http: HttpClient, private adal: AdalService, private accountService: AccountService) {
        this.adal.currentUser.subscribe(x => this._currentUser = x);
        this.http.get("");
    }

    public request<T = any>(method: string, uri: string, options: any): Observable<HttpResponse<T>> {
        return this.accountService.currentAccount.take(1)
            .flatMap((account) => {
                return this.adal.accessTokenData(account.subscription.tenantId, Constants.ResourceUrl.msGraph);
            })
            .flatMap((accessToken) => {
                options = this._setupRequestOptions(uri, options, accessToken);
                return this.http.request<T>(method, this._computeUrl(uri), options)
                    .retryWhen(attempts => this._retryWhen(attempts))
                    .catch((error) => {
                        const err = ServerError.fromMsGraph(error);
                        return Observable.throw(err);
                    }) as Observable<HttpResponse<T>>;
            }).shareReplay(1);
    }

    public get<T>(uri: string, options?: HttpRequestOptions): Observable<HttpResponse<T>> {
        return this.request<T>("get", uri, options);
    }

    public post(uri: string, options?: HttpRequestOptions) {
        return this.request("post", uri, options);
    }

    public patch(uri: string, options?: HttpRequestOptions) {
        return this.request("patch", uri, options);
    }

    public put(uri: string, options?: HttpRequestOptions) {
        return this.request("put", uri, options);
    }

    public delete(uri: string, options?: HttpRequestOptions) {
        return this.request("delete", uri, options);
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
        return options;
    }

    private _retryWhen(attempts: Observable<Response>) {
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

    private _computeUrl(uri: string): string {
        // TODO-TIM change to url-utils
        if (/^https?:\/\//i.test(uri)) {
            return uri;
        } else {
            return Location.joinWithSlash(Constants.ServiceUrl.msGraph, uri);
        }
    }
}
