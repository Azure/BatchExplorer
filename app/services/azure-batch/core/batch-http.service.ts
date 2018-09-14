import { Location } from "@angular/common";
import { HttpHandler, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpRequestOptions, HttpService, ServerError } from "@batch-flask/core";
import { UrlUtils } from "@batch-flask/utils";
import { ArmBatchAccount, BatchAccount, LocalBatchAccount } from "app/models";
import { AdalService } from "app/services/adal";
import { BatchAccountService } from "app/services/batch-account";
import { BatchExplorerService } from "app/services/batch-explorer.service";
import { Constants } from "common";
import { Observable, from, throwError } from "rxjs";
import { catchError, flatMap, map, retryWhen, shareReplay, take } from "rxjs/operators";
import { BatchSharedKeyAuthenticator } from "./batch-shared-key-authenticator";

@Injectable()
export class AzureBatchHttpService extends HttpService {
    public get serviceUrl() {
        return this.batchExplorer.azureEnvironment.batchUrl;
    }

    constructor(
        httpHandler: HttpHandler,
        private adal: AdalService,
        private accountService: BatchAccountService,
        private batchExplorer: BatchExplorerService) {
        super(httpHandler);
    }

    public request(method: any, uri?: any, options?: any): Observable<any> {
        options = this._addApiVersion(uri, options);
        return this.accountService.currentAccount.pipe(
            take(1),
            flatMap((account) => {
                const url = this._computeUrl(uri, account);
                let obs;
                if (account instanceof ArmBatchAccount) {
                    obs = this._setupRequestForArm(account, options);
                } else if (account instanceof LocalBatchAccount) {
                    obs = this._setupRequestForSharedKey(account, method, url, options);
                } else {
                    throw new Error(`Invalid account type ${account}`);
                }
                return obs.pipe(
                    flatMap((options) => {
                        return super.request(
                            method,
                            url,
                            options).pipe(
                                retryWhen(attempts => this.retryWhen(attempts)),
                                catchError((error) => {
                                    const err = ServerError.fromBatchHttp(error);
                                    return throwError(err);
                                }),
                            );
                    }),
                );
            }),
            shareReplay(1),
        );
    }

    private _setupRequestForArm(account: ArmBatchAccount, options) {
        const tenantId = account.subscription.tenantId;
        return this.adal.accessTokenData(tenantId, this.serviceUrl).pipe(
            map((accessToken) => this.addAuthorizationHeader(options, accessToken)),
        );
    }

    private _setupRequestForSharedKey(account: LocalBatchAccount, method: string, uri: string, options) {
        const sharedKey = new BatchSharedKeyAuthenticator(account.name, account.key);
        return from(sharedKey.signRequest(method, uri, options)).pipe(map(() => options));
    }

    private _addApiVersion(uri: string, options: HttpRequestOptions): HttpRequestOptions {
        if (!(options.params instanceof HttpParams)) {
            options.params = new HttpParams({ fromObject: options.params });
        }

        if (!options.params.has("api-version") && !uri.contains("api-version")) {
            options.params = options.params.set("api-version", Constants.ApiVersion.batchService);
        }
        if (!options.headers) {
            options.headers = new HttpHeaders();
        }
        options.headers = (options.headers as any)
            .set("Content-Type", "application/json; odata=minimalmetadata; charset=UTF-8")
            .set("Cache-Control", "no-cache");

        return options;
    }

    private _computeUrl(uri: string, account: BatchAccount) {
        if (UrlUtils.isHttpUrl(uri)) {
            return uri;
        } else {
            return Location.joinWithSlash(account.url, uri);
        }
    }
}
