import { Location } from "@angular/common";
import { HttpHandler, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpRequestOptions, HttpService, ServerError } from "@batch-flask/core";
import { UrlUtils } from "@batch-flask/utils";
import { AccountResource } from "app/models";
import { AdalService } from "app/services/adal";
import { AccountService } from "app/services/batch-account.service";
import { BatchExplorerService } from "app/services/batch-labs.service";
import { Constants } from "common";
import { Observable, from, throwError } from "rxjs";
import { catchError, flatMap, retryWhen, shareReplay, take } from "rxjs/operators";
import { BatchSharedKeyCredentials } from "./shared-key-utils";

@Injectable()
export class AzureBatchHttpService extends HttpService {
    public get serviceUrl() {
        return this.batchExplorer.azureEnvironment.batchUrl;
    }

    constructor(
        httpHandler: HttpHandler,
        private adal: AdalService,
        private accountService: AccountService,
        private batchExplorer: BatchExplorerService) {
        super(httpHandler);
    }

    public request(method: any, uri?: any, options?: any): Observable<any> {
        options = this._addApiVersion(uri, options);
        return this.accountService.currentAccount.pipe(
            take(1),
            flatMap((account) => {
                const tenantId = account.subscription.tenantId;
                return this.adal.accessTokenData(tenantId, this.serviceUrl).pipe(
                    flatMap(() => {
                        // TODO-TIM remove
                        const sharedKey = new BatchSharedKeyCredentials("", "");
                        return from(sharedKey.signRequest(method, uri, options));
                    }),
                    flatMap((accessToken) => {
                        // options = this.addAuthorizationHeader(options, accessToken);
                        return super.request(
                            method,
                            this._computeUrl(uri, account),
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
            .set("Content-Type", "application/json; odata=minimalmetadata; charset=utf-8")
            .set("Cache-Control", "no-cache");

        return options;
    }

    private _computeUrl(uri: string, account: AccountResource) {
        if (UrlUtils.isHttpUrl(uri)) {
            return uri;
        } else {
            return Location.joinWithSlash(`https://${account.properties.accountEndpoint}`, uri);
        }
    }
}
