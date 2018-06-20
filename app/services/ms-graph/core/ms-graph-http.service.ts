import { HttpHandler } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { HttpService, ServerError } from "@batch-flask/core";
import { AccountService } from "app/services/account.service";
import { AdalService } from "app/services/adal";
import { BatchLabsService } from "app/services/batch-labs.service";
import { AADUser } from "client/core/aad/adal/aad-user";
import { flatMap, shareReplay, take } from "rxjs/operators";

/**
 * Class wrapping around the http service to call Microsoft Graph api
 */
@Injectable()
export class MsGraphHttpService extends HttpService {
    public get serviceUrl() {
        return this.batchLabs.azureEnvironment.msGraph;
    }

    private _currentUser: AADUser;
    constructor(
        httpHandler: HttpHandler,
        private adal: AdalService,
        private accountService: AccountService,
        private batchLabs: BatchLabsService) {

        super(httpHandler);
        this.adal.currentUser.subscribe(x => this._currentUser = x);
    }

    public request(method: any, uri?: any, options?: any): Observable<any> {
        return this.accountService.currentAccount.pipe(
            take(1),
            flatMap((account) => {
                return this.adal.accessTokenData(account.subscription.tenantId, this.serviceUrl);
            }),
            flatMap((accessToken) => {
                options = this.addAuthorizationHeader(options, accessToken);
                return super.request(method, this.computeUrl(uri), options)
                    .retryWhen(attempts => this.retryWhen(attempts))
                    .catch((error) => {
                        const err = ServerError.fromMsGraph(error);
                        return Observable.throw(err);
                    }) as Observable<any>;
            }),
            shareReplay(1),
        );
    }
}
