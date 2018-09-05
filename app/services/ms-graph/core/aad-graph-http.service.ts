import { Location } from "@angular/common";
import { HttpHandler, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";

import { HttpRequestOptions, HttpService, ServerError } from "@batch-flask/core";
import { UrlUtils } from "@batch-flask/utils";
import { AdalService } from "app/services/adal";
import { BatchAccountService } from "app/services/batch-account";
import { BatchExplorerService } from "app/services/batch-labs.service";
import { AADUser } from "client/core/aad/adal/aad-user";
import { Constants } from "common";
import { catchError, flatMap, retryWhen, shareReplay, take, tap } from "rxjs/operators";
import { ArmBatchAccount } from "app/models";

@Injectable()
export class AADGraphHttpService extends HttpService {
    public get serviceUrl() {
        return this.batchExplorer.azureEnvironment.aadGraph;
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
                        message: "Cannot use this functionality with a local batch account",
                        status: 406,
                    });
                }
            }),
            flatMap((account: ArmBatchAccount) => {
                const tenantId = account.subscription.tenantId;
                return this.adal.accessTokenData(tenantId, this.serviceUrl).pipe(
                    flatMap((accessToken) => {
                        options = this.addAuthorizationHeader(options, accessToken);
                        options = this._addApiVersion(options);
                        return super.request(
                            method,
                            this._computeUrl(uri, tenantId),
                            options).pipe(
                                retryWhen(attempts => this.retryWhen(attempts)),
                                catchError((error) => {
                                    const err = ServerError.fromAADGraph(error);
                                    return throwError(err);
                                }),
                            );
                    }));
            }),
            shareReplay(1),
        );
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
