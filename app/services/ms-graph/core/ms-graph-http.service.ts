import { HttpHandler } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpService, ServerError } from "@batch-flask/core";
import { AdalService } from "app/services/adal";
import { BatchAccountService } from "app/services/batch-account";
import { BatchExplorerService } from "app/services/batch-labs.service";
import { AADUser } from "client/core/aad/adal/aad-user";
import { Observable, throwError } from "rxjs";
import { catchError, flatMap, retryWhen, shareReplay, take, tap } from "rxjs/operators";
import { ArmBatchAccount } from "../../../models";

/**
 * Class wrapping around the http service to call Microsoft Graph api
 */
@Injectable()
export class MsGraphHttpService extends HttpService {
    public get serviceUrl() {
        return this.batchExplorer.azureEnvironment.msGraph;
    }

    private _currentUser: AADUser;
    constructor(
        httpHandler: HttpHandler,
        private adal: AdalService,
        private accountService: BatchAccountService,
        private batchExplorer: BatchExplorerService) {

        super(httpHandler);
        this.adal.currentUser.subscribe(x => this._currentUser = x);
    }

    public request(method: any, uri?: any, options?: any): Observable<any> {
        return this.accountService.currentAccount.pipe(
            take(1),
            tap((account) => {
                if (!(account instanceof ArmBatchAccount)) {
                    throw new ServerError({
                        code: "LocalBatchAccount",
                        message: "Cannot use GRAPH with a local batch account",
                        status: 406,
                    });
                }
            }),
            flatMap((account: ArmBatchAccount) => {
                return this.adal.accessTokenData(account.subscription.tenantId, this.serviceUrl);
            }),
            flatMap((accessToken) => {
                options = this.addAuthorizationHeader(options, accessToken);
                return super.request(method, this.computeUrl(uri), options).pipe(
                    retryWhen(attempts => this.retryWhen(attempts)),
                    catchError((error) => {
                        const err = ServerError.fromMsGraph(error);
                        return throwError(err);
                    }),
                );
            }),
            shareReplay(1),
        );
    }
}
