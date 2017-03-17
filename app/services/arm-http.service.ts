import { Injectable } from "@angular/core";
import {
    RequestMethod, RequestOptions, RequestOptionsArgs, Response,
} from "@angular/http";
import { Observable } from "rxjs";

import { AccountService, AzureHttpService } from "app/services";
import { Constants } from "app/utils";
import { AdalService } from "./adal";


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
    constructor(private http: AzureHttpService, private adal: AdalService, private accountService: AccountService) {
    }

    public request(uri: string, options: RequestOptionsArgs): Observable<Response> {
        return this.accountService.currentAccount.first()
            .flatMap(account => this.http.request(account.subscription, uri, options))
            .share();
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
