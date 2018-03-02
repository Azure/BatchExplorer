import { Location } from "@angular/common";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { HttpRequestOptions, HttpService } from "@batch-flask/core";
import { UrlUtils } from "@batch-flask/utils";
import { ServerError } from "app/models";
import { AccountService } from "app/services/account.service";
import { AdalService } from "app/services/adal";
import { AADUser } from "client/core/aad/adal/aad-user";
import { Constants } from "common";

@Injectable()
export class AADGraphHttpService extends HttpService {
    public get serviceUrl() {
        return Constants.ServiceUrl.aadGraph;
    }

    private _currentUser: AADUser;
    constructor(private http: HttpClient, private adal: AdalService, private accountService: AccountService) {
        super();
        this.adal.currentUser.subscribe(x => this._currentUser = x);
        this.http.get("");
    }

    public request<T = any>(method: string, uri: string, options: any): Observable<T> {
        return this.accountService.currentAccount.take(1)
            .flatMap((account) => {
                return this.adal.accessTokenData(account.subscription.tenantId, Constants.ResourceUrl.aadGraph)
                    .flatMap((accessToken) => {
                        options = this.addAuthorizationHeader(options, accessToken);
                        options = this._addApiVersion(options);
                        return this.http.request<T>(
                            method,
                            this._computeUrl(uri, account.subscription.tenantId),
                            options)
                            .retryWhen(attempts => this.retryWhen(attempts))
                            .catch((error) => {
                                const err = ServerError.fromAADGraph(error);
                                return Observable.throw(err);
                            });
                    });
            }).shareReplay(1);
    }

    private _addApiVersion(options: HttpRequestOptions): HttpRequestOptions {
        if (!(options.params instanceof HttpParams)) {
            options.params = new HttpParams(options.params);
        }

        if (!options.params.get("api-version")) {
            options.params = options.params.set("api-version", Constants.ApiVersion.aadGraph);
        }

        return options;
    }

    private _computeUrl(uri: string, tenantId: string) {
        if (UrlUtils.isHttpUrl(uri)) {
            return uri;
        } else {
            return Location.joinWithSlash(this.serviceUrl, Location.joinWithSlash(tenantId, uri));
        }
    }
}
