import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import {
    Headers, Http, RequestMethod, RequestOptions, RequestOptionsArgs, Response, URLSearchParams,
} from "@angular/http";
import { AsyncSubject, Observable } from "rxjs";

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

/**
 * Wrapper around the http service so call the azure ARM api.
 * Set the Authorization header and the api version
 */
@Injectable()
export class AzureHttpService {
    constructor(private http: Http, private adal: AdalService) {
    }

    public request(uri: string, options: RequestOptionsArgs): Observable<Response> {
        const subject = new AsyncSubject<Response>();
        this.adal.accessTokenData.subscribe({
            next: (accessToken) => {
                options = this._setupRequestOptions(options, accessToken);
                this.http.request(Location.joinWithSlash(baseUrl, uri), options).subscribe({
                    next: (data) => {
                        subject.next(data);
                        subject.complete();
                    },
                    error: (e) => subject.error(e),
                });
            },
            error: (e) => subject.error(e),
        });
        return subject.asObservable();
    }

    public get(uri: string, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Get));
    }

    public post(uri: string, options?: RequestOptionsArgs) {
        return this.request(uri, mergeOptions(options, RequestMethod.Post));
    }

    private _setupRequestOptions(originalOptions: RequestOptionsArgs, accessToken: AccessToken): RequestOptionsArgs {
        const options = new RequestOptions(originalOptions);
        options.headers = new Headers(originalOptions.headers);
        options.headers.append("Authorization", `${accessToken.token_type} ${accessToken.access_token}`);
        if (!options.search) {
            options.search = new URLSearchParams();
        }
        options.search.set(apiVersionParams, apiVersion);

        return options;
    }
}
