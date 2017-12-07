import { Headers, Http, RequestOptions } from "@angular/http";
import { Observable } from "rxjs";

import { logger } from "client/logger";
import { AdalConfig } from "../adal-config";
import { baseUrl, objectToParams } from "../adal-constants";
import { AccessToken } from "./access-token.model";

const contentType = "application/x-www-form-urlencoded";

export enum AccessTokenError {
    invalidGrant = "invalid_grant",
}

export interface AccessTokenErrorResult {
    error: AccessTokenError;
    error_description: string;
    error_codes: number[];
    timestamp: string;
    trace_id: string;
    correlation_id: string;
}

/**
 * This service handle the retrival of the access token to auth AAD queries
 */
export class AccessTokenService {
    constructor(private config: AdalConfig, private http: Http) {
    }

    /**
     * Retrieve the access token using the given authorization code
     */
    public redeem(resource: string, tenantId: string, authorizationCode: string): Observable<AccessToken> {
        const obs = this.http.post(this._buildUrl(tenantId),
            this._redeemBody(resource, authorizationCode),
            this._options())
            .share()
            .map((response) => {
                const data = response.json();
                return this._processResponse(data);
            });

        obs.subscribe({
            error: (error) => {
                logger.error("Error redeem the auth code for access token", error);
            },
        });

        return obs;
    }

    public refresh(resource: string, tenantId: string, refreshToken: string): Observable<AccessToken> {
        const obs = this.http.post(
            this._buildUrl(tenantId),
            this._refreshBody(resource, refreshToken),
            this._options())
            .share()
            .map((response) => {
                const data = response.json();
                return this._processResponse(data);
            });

        obs.subscribe({
            error: (error) => {
                logger.error("Error refresh access token", error);
            },
        });
        return obs;
    }

    private _buildUrl(tenantId: string) {
        return `${baseUrl}/${tenantId}/oauth2/token`;
    }

    private _redeemBody(resource: string, authorizationCode: string) {
        const params = {
            grant_type: "authorization_code",
            client_id: this.config.clientId,
            code: authorizationCode,
            resource: resource,
            redirect_uri: this.config.redirectUri,
        };
        return objectToParams(params);
    }

    private _refreshBody(resource, refreshToken: string) {
        const params = {
            grant_type: "refresh_token",
            client_id: this.config.clientId,
            refresh_token: refreshToken,
            resource: resource,
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
