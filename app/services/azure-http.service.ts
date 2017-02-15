import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import {
    Headers, Http, RequestMethod, RequestOptions, RequestOptionsArgs, Response, URLSearchParams, ResponseOptions,
} from "@angular/http";
import { Observable } from "rxjs";

import { ServerError } from "app/models";
import { Constants } from "app/utils";
import { AccessToken, AdalService } from "./adal";

const apiVersionParams = "api-version";
const apiVersion = Constants.ApiVersion.arm;
const baseUrl = "https://management.azure.com";

function mergeOptions(original: RequestOptionsArgs, method: RequestMethod): RequestOptionsArgs {
    const options = original || new RequestOptions();
    options.method = method;
    return options;
}

const providersApiVersion = {
    "Microsoft.Batch": Constants.ApiVersion.armBatch,
};

/**
 * Wrapper around the http service so call the azure ARM api.
 * Set the Authorization header and the api version
 */
@Injectable()
export class AzureHttpService {
    constructor(private http: Http, private adal: AdalService) {
    }

    public request(uri: string, options: RequestOptionsArgs): Observable<Response> {
        return this.adal.accessTokenData.flatMap((accessToken) => {
            options = this._setupRequestOptions(uri, options, accessToken);
            return this.http.request(this._computeUrl(uri), options)
                .retryWhen(attempts => this._retryWhen(attempts))
                .catch((error) => {
                    return Observable.throw(ServerError.fromARM(error));
                });
        }).share();
    }

    public get(uri: string, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Get));
    }

    public post(uri: string, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Post));
    }

    public apiVersion(uri: string) {
        const providerSpecific = /.*\/providers\/([a-zA-Z.]*)\/.+/i;
        const match = providerSpecific.exec(uri);
        if (match && match.length > 1) {
            const provider = match[1];
            if (provider in providersApiVersion) {
                return providersApiVersion[provider];
            } else {
                throw `Unkown provider '${provider}'`;
            }
        }
        return apiVersion;
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
        options.search.set(apiVersionParams, this.apiVersion(uri));

        return options;
    }

    private _computeUrl(uri: string): string {
        if (/^https?:\/\//i.test(uri)) {
            return uri;
        } else {
            return Location.joinWithSlash(baseUrl, uri);
        }
    }

    private _retryWhen(attempts: Observable<Response>) {
        const retryRange = Observable.range(0, Constants.badHttpCodeMaxRetryCount + 1);
        return attempts
            .switchMap((x: any) => {
                console.log("switching map", x);
                if (Constants.RetryableHttpCode.has(x.status)) {
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
