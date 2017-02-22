import { Headers, Http, RequestOptions } from "@angular/http";
import { Observable } from "rxjs";

import { log } from "app/utils";
import { AccessToken } from "./access-token";
import { AdalConfig } from "./adal-config";
import { baseUrl, objectToParams } from "./adal-constants";

const contentType = "application/x-www-form-urlencoded";

/**
 * This service handle the retrival of the access token to auth AAD queries
 */
export class AccessTokenService {
    constructor(private config: AdalConfig, private http: Http) {
    }

    /**
     * Retrieve the access token using the given authorization code
     */
    public redeem(authorizationCode: string): Observable<AccessToken> {
        const obs = this.http.post(this._buildUrl(), this._redeemBody(authorizationCode), this._options()).share()
            .map((response) => {
                const data = response.json();
                return this._processResponse(data);
            });

        obs.subscribe({
            error: (error) => {
                log.error("Error redeem the auth code for access token", error);
            },
        });

        return obs;
    }

    public refresh(refreshToken: string): Observable<AccessToken> {
        const obs = this.http.post(this._buildUrl(), this._refreshBody(refreshToken), this._options()).share()
            .map((response) => {
                const data = response.json();
                return this._processResponse(data);
            });

        obs.subscribe({
            error: (error) => {
                log.error("Error refresh access token", error);
            },
        });
        return obs;
    }

    private _buildUrl() {
        return `${baseUrl}/${this.config.tenant}/oauth2/token`;
    }

    private _redeemBody(authorizationCode: string) {
        const params = {
            grant_type: "authorization_code",
            client_id: this.config.clientId,
            code: authorizationCode,
            resource: "https://management.core.windows.net/",
            redirect_uri: this.config.redirectUri,
        };
        return objectToParams(params);
    }

    private _refreshBody(refresh_token: string) {
        const params = {
            grant_type: "refresh_token",
            client_id: this.config.clientId,
            refresh_token: refresh_token,
            resource: "https://management.core.windows.net/",
            redirect_uri: this.config.redirectUri,
        };
        return objectToParams(params);
    }

    private _options(): RequestOptions {
        const headers = new Headers({ "Content-Type": contentType });
        return new RequestOptions({ headers });
    }

    private _processResponse(data: any): AccessToken {
        const result = new AccessToken({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            token_type: data.token_type,
            expires_in: Number(data.expires_in),
            ext_expires_in: Number(data.ext_expires_in),
            expires_on: new Date(Number(data.expires_on) * 1000),
            not_before: new Date(Number(data.not_before) * 1000),
        });
        return result;
    }
}
