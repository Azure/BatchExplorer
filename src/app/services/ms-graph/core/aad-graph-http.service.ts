import { Location } from "@angular/common";
import { HttpHandler, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpRequestOptions, HttpService, ServerError } from "@batch-flask/core";
import { UrlUtils } from "@batch-flask/utils";
import { ArmBatchAccount } from "app/models";
import { AuthService } from "app/services/aad";
import { BatchAccountService } from "app/services/batch-account";
import { BatchExplorerService } from "app/services/batch-explorer.service";
import { Constants } from "common";
import { Observable, throwError } from "rxjs";
import { catchError, flatMap, retryWhen, shareReplay, take, tap } from "rxjs/operators";

@Injectable({providedIn: "root"})
export class AADGraphHttpService extends HttpService {
    public get serviceUrl() {
        return this.batchExplorer.azureEnvironment.aadGraph;
    }

    constructor(
        httpHandler: HttpHandler,
        private auth: AuthService,
        private accountService: BatchAccountService,
        private batchExplorer: BatchExplorerService) {
        super(httpHandler);
    }

    public request(method: any, uri?: any, options?: any): Observable<any> {
        return this.accountService.currentAccount.pipe(
            take(1),
            tap((account) => {
                if (!(account instanceof ArmBatchAccount)) {
                    throw new ServerError({
                        code: "LocalBatchAccount",
                        message: "Cannot use AAD with a local batch account",
                        status: 406,
                    });
                }
            }),
            flatMap((account: ArmBatchAccount) => {
                const tenantId = account.subscription.tenantId;
                return this.auth.accessTokenData(tenantId, "aadGraph").pipe(
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
