import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { HttpService } from "@batch-flask/core";
import { ServerError } from "app/models";
import { AccountService } from "app/services/account.service";
import { AdalService } from "app/services/adal";
import { AADUser } from "client/core/aad/adal/aad-user";
import { Constants } from "common";

/**
 * Class wrapping around the http service to call Microsoft Graph api
 */
@Injectable()
export class MsGraphHttpService extends HttpService {
    public get serviceUrl() {
        return Constants.ServiceUrl.msGraph;
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
                return this.adal.accessTokenData(account.subscription.tenantId, Constants.ResourceUrl.msGraph);
            })
            .flatMap((accessToken) => {
                options = this.addAuthorizationHeader(options, accessToken);
                return this.http.request<T>(method, this.computeUrl(uri), options)
                    .retryWhen(attempts => this.retryWhen(attempts))
                    .catch((error) => {
                        const err = ServerError.fromMsGraph(error);
                        return Observable.throw(err);
                    });
            }).shareReplay(1);
    }
}
