import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import {
    Headers, Http, RequestMethod, RequestOptions, RequestOptionsArgs, Response, URLSearchParams,
} from "@angular/http";
import { Observable } from "rxjs";

import { AccessToken, RetryableHttpCode, ServerError } from "@batch-flask/core";
import { Subscription } from "app/models";
import { Constants } from "common";
import { AdalService } from "./adal";
import { BatchExplorerService } from "./batch-labs.service";

const apiVersionParams = "api-version";
const apiVersion = Constants.ApiVersion.arm;

function mergeOptions(original: RequestOptionsArgs, method: RequestMethod, body?: any): RequestOptionsArgs {
    const options = original || new RequestOptions();
    options.method = method;
    if (body) {
        options.body = body;
    }

    return options;
}

const providersApiVersion = {
    "microsoft.batch": Constants.ApiVersion.armBatch,
    "microsoft.classicstorage": Constants.ApiVersion.armClassicStorage,
    "microsoft.storage": Constants.ApiVersion.armStorage,
    "microsoft.compute": Constants.ApiVersion.compute,
    "microsoft.commerce": Constants.ApiVersion.commerce,
    "microsoft.authorization": Constants.ApiVersion.authorization,
    "microsoft.insights": Constants.ApiVersion.monitor,
    "microsoft.network": Constants.ApiVersion.network,
    "microsoft.classicnetwork": Constants.ApiVersion.classicNetwork,
};

type SubscriptionOrTenant = Subscription | string;

/**
 * Wrapper around the http service so call the azure ARM api.
 * Set the Authorization header and the api version
 */
@Injectable()
export class AzureHttpService {
    constructor(private http: Http, private adal: AdalService, private batchExplorer: BatchExplorerService) {
    }

    public request(
        subscriptionOrTenant: SubscriptionOrTenant,
        uri: string,
        options: RequestOptionsArgs): Observable<Response> {

        return this.adal.accessTokenData(this._getTenantId(subscriptionOrTenant, uri))
            .flatMap((accessToken) => {
                options = this._setupRequestOptions(uri, options, accessToken);
                return this.http.request(this._computeUrl(uri), options)
                    .retryWhen(attempts => this._retryWhen(attempts))
                    .catch((error) => {
                        const err = ServerError.fromARM(error);
                        return Observable.throw(err);
                    });
            }).share();
    }

    public get baseUrl() {
        return this.batchExplorer.azureEnvironment.armUrl;
    }

    public get(subscription: SubscriptionOrTenant, uri: string, options?: RequestOptionsArgs) {
        return this.request(subscription, uri, mergeOptions(options, RequestMethod.Get));
    }

    public post(subscription: SubscriptionOrTenant, uri: string, body?: any, options?: RequestOptionsArgs) {
        return this.request(subscription, uri, mergeOptions(options, RequestMethod.Post, body));
    }

    public put(subscription: SubscriptionOrTenant, uri: string, options?: RequestOptionsArgs) {
        return this.request(subscription, uri, mergeOptions(options, RequestMethod.Put));
    }

    public patch(subscription: SubscriptionOrTenant, uri: string, body: any, options?: RequestOptionsArgs) {
        return this.request(subscription, uri, mergeOptions(options, RequestMethod.Patch, body));
    }

    public delete(subscription: Subscription, uri: string, options?: RequestOptionsArgs) {
        return this.request(subscription, uri, mergeOptions(options, RequestMethod.Delete));
    }

    public apiVersion(uri: string) {
        const providerSpecific = /.*\/providers\/([a-zA-Z.]*)\/.+/i;
        const match = providerSpecific.exec(uri);
        if (match && match.length > 1) {
            const provider = match[1].toLowerCase();
            if (provider in providersApiVersion) {
                return providersApiVersion[provider];
            } else {
                throw new Error(`Unkown provider '${provider}'`);
            }
        }
        return apiVersion;
    }

    private _getTenantId(subscriptionOrTenant: SubscriptionOrTenant, uri: string): string {
        if (subscriptionOrTenant instanceof Subscription) {
            return subscriptionOrTenant.tenantId;
        } else if (typeof subscriptionOrTenant === "string") {
            return subscriptionOrTenant;
        } else {
            throw new Error(`Invalid param in azure http service for uri "${uri}". `
                + `Expected Subscription or tenant id but got ${subscriptionOrTenant}`);
        }
    }

    private _setupRequestOptions(
        uri: string,
        originalOptions: RequestOptionsArgs,
        accessToken: AccessToken): RequestOptionsArgs {

        const options = new RequestOptions(originalOptions);
        options.headers = new Headers(originalOptions.headers);
        options.headers.append("Authorization", `${accessToken.token_type} ${accessToken.access_token}`);
        if (!options.search) {
            options.search = new URLSearchParams();
        }

        if (!uri.includes(apiVersionParams)) {
            options.search.set(apiVersionParams, this.apiVersion(uri));
        }
        return options;
    }

    private _computeUrl(uri: string): string {
        if (/^https?:\/\//i.test(uri)) {
            return uri;
        } else {
            return Location.joinWithSlash(this.baseUrl, uri);
        }
    }

    private _retryWhen(attempts: Observable<Response>) {
        const retryRange = Observable.range(0, Constants.badHttpCodeMaxRetryCount + 1);
        return attempts
            .switchMap((x: any) => {
                if (RetryableHttpCode.has(x.status)) {
                    return Observable.of(x);
                }
                return Observable.throw(x);
            })
            .zip(retryRange, (attempt, retryCount) => {
                if (retryCount >= Constants.badHttpCodeMaxRetryCount) {
                    throw attempt;
                }
                return retryCount;
            })
            .flatMap((retryCount) => {
                return Observable.timer(100 * Math.pow(3, retryCount));
            });
    }
}
