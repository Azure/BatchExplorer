import { Location } from "@angular/common";
import { HttpHandler, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { HttpRequestOptions, HttpService, ServerError } from "@batch-flask/core";
import { UrlUtils } from "@batch-flask/utils";
import { AccountService } from "app/services/account.service";
import { AdalService } from "app/services/adal";
import { BatchLabsService } from "app/services/batch-labs.service";
import { AADUser } from "client/core/aad/adal/aad-user";
import { Constants } from "common";
import { flatMap, shareReplay, take } from "rxjs/operators";

@Injectable()
export class AADGraphHttpService extends HttpService {
    public get serviceUrl() {
        return this.batchLabs.azureEnvironment.aadGraph;
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
                const tenantId = account.subscription.tenantId;
                return this.adal.accessTokenData(tenantId, this.serviceUrl).pipe(
                    flatMap((accessToken) => {
                        options = this.addAuthorizationHeader(options, accessToken);
                        options = this._addApiVersion(options);
                        return super.request(
                            method,
                            this._computeUrl(uri, tenantId),
                            options)
                            .retryWhen(attempts => this.retryWhen(attempts))
                            .catch((error) => {
                                const err = ServerError.fromAADGraph(error);
                                return Observable.throw(err);
                            });
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
