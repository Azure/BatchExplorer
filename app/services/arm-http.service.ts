import { Injectable } from "@angular/core";
import {
    RequestMethod, RequestOptions, RequestOptionsArgs, Response,
} from "@angular/http";
import { ServerError } from "@batch-flask/core";
import { Observable } from "rxjs";
import { first, flatMap, share, tap } from "rxjs/operators";
import { ArmBatchAccount } from "../models";
import { AdalService } from "./adal";
import { AzureHttpService } from "./azure-http.service";
import { BatchAccountService } from "./batch-account";

function mergeOptions(original: RequestOptionsArgs, method: RequestMethod, body?: any): RequestOptionsArgs {
    const options = original || new RequestOptions();
    options.method = method;
    if (body) {
        options.body = body;
    }

    return options;
}

/**
 * Small helper that will use the current account to get current tenantId.
 */
@Injectable()
export class ArmHttpService {
    constructor(private http: AzureHttpService, adal: AdalService, private accountService: BatchAccountService) {
    }

    public request(uri: string, options: RequestOptionsArgs): Observable<Response> {
        return this.accountService.currentAccount.pipe(
            first(),
            tap((account) => {
                if (!(account instanceof ArmBatchAccount)) {
                    throw new ServerError({
                        code: "LocalBatchAccount",
                        message: "Cannot use ARM functionalities with a local batch account",
                        details: [
                            {key: "Url", value: uri},
                        ],
                        status: 406,
                    });
                }
            }),
            flatMap((account: ArmBatchAccount) => this.http.request(account.subscription, uri, options)),
            share(),
        );
    }

    public get(uri: string, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Get));
    }

    public post(uri: string, body?: any, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Post, body));
    }

    public put(uri: string, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Put));
    }

    public patch(uri: string, body: any, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Patch, body));
    }

    public delete(uri: string, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Delete));
    }
}
