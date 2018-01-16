import { Location } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { HttpRequestOptions, HttpService } from "app/core";
import { ServerError } from "app/models";
import { AccountService } from "app/services/account.service";
import { AdalService } from "app/services/adal";
import { AccessToken } from "client/core/aad/access-token";
import { AADUser } from "client/core/aad/adal/aad-user";
import { Constants } from "common";
import { UrlUtils } from "common/utils";

/**
 * Class wrapping around the http service to call Microsoft Graph api
 */
@Injectable()
export class MsGraphHttpService extends HttpService {
    private _currentUser: AADUser;
    constructor(private http: HttpClient, private adal: AdalService, private accountService: AccountService) {
        super();
        this.adal.currentUser.subscribe(x => this._currentUser = x);
        this.http.get("");
    }

    public request<T = any>(method: string, uri: string, options: any): Observable<T> {
        return this.accountService.currentAccount.take(1)
            .flatMap((account) => {
                return this.adal.accessTokenData(account.subscription.tenantId, Constants.ResourceUrl.msGraph);
            })
            .flatMap((accessToken) => {
                options = this._setupRequestOptions(uri, options, accessToken);
                return this.http.request<T>(method, this._computeUrl(uri), options)
                    .retryWhen(attempts => this.retryWhen(attempts))
                    .catch((error) => {
                        const err = ServerError.fromMsGraph(error);
                        return Observable.throw(err);
                    });
            }).shareReplay(1);
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

    private _computeUrl(uri: string): string {
        if (UrlUtils.isHttpUrl(uri)) {
            return uri;
        } else {
            return Location.joinWithSlash(Constants.ServiceUrl.msGraph, uri);
        }
    }
}
