import { Injectable } from "@angular/core";
import { HttpInterface, HttpMethod, HttpRequestOptions, ServerError } from "@batch-flask/core";
import { Observable } from "rxjs";
import { first, share, switchMap, tap } from "rxjs/operators";
import { ArmBatchAccount } from "../models";
import { AdalService } from "./adal";
import { AzureHttpService } from "./azure-http.service";
import { BatchAccountService } from "./batch-account";

function mergeOptions(original: HttpRequestOptions, body?: any): HttpRequestOptions {
    const options = original || {};
    if (body) {
        options.body = body;
    }

    return options;
}

/**
 * Small helper that will use the current account to get current tenantId.
 */
@Injectable()
export class ArmHttpService implements HttpInterface {
    constructor(private http: AzureHttpService, adal: AdalService, private accountService: BatchAccountService) {
    }

    public request(method: HttpMethod, uri: string, options: HttpRequestOptions): Observable<any> {
        return this.accountService.currentAccount.pipe(
            first(),
            tap((account) => {
                if (!(account instanceof ArmBatchAccount)) {
                    throw new ServerError({
                        code: "LocalBatchAccount",
                        message: "Cannot use ARM functionalities with a local batch account",
                        details: [
                            { key: "Url", value: uri },
                        ],
                        status: 406,
                    });
                }
            }),
            switchMap((account: ArmBatchAccount) => this.http.request(method, account.subscription, uri, options)),
            share(),
        );
    }

    public get<T>(uri: string, options?: HttpRequestOptions): Observable<T> {
        return this.request(HttpMethod.Get, uri, options);
    }

    public post<T>(uri: string, body?: any, options?: HttpRequestOptions): Observable<T> {
        return this.request(HttpMethod.Post, uri, mergeOptions(options, body));
    }

    public put<T>(uri: string, options?: HttpRequestOptions): Observable<T> {
        return this.request(HttpMethod.Put, uri, options);
    }

    public patch<T>(uri: string, body: any, options?: HttpRequestOptions): Observable<T> {
        return this.request(HttpMethod.Patch, uri, mergeOptions(options, body));
    }

    public delete<T>(uri: string, options?: HttpRequestOptions): Observable<T> {
        return this.request(HttpMethod.Delete, uri, options);
    }
}
