import { AccessToken } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { BatchExplorerApplication } from "client/core//batch-explorer-application";
import { RequestInit, fetch } from "client/core/fetch";
import { AADConfig } from "../aad-config";
import { objectToParams } from "../adal-constants";

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
    constructor(private app: BatchExplorerApplication, private config: AADConfig) {

    }

    /**
     * Retrieve the access token using the given authorization code
     */
    public async redeem(resource: string, tenantId: string, authorizationCode: string): Promise<AccessToken> {
        try {
            const response = await fetch(this._buildUrl(tenantId), {
                method: "post",
                body: this._redeemBody(resource, authorizationCode),
                ...this._options(),
            });
            const data = await response.json();

            return this._processResponse(data);
        } catch (error) {
            log.error("Error redeem the auth code for access token", error);
            throw error;
        }
    }

    public async refresh(resource: string, tenantId: string, refreshToken: string): Promise<AccessToken> {
        try {
            const response = await fetch(this._buildUrl(tenantId), {
                method: "post",
                body: this._refreshBody(resource, refreshToken),
                ...this._options(),
            });
            const data = await response.json();
            return this._processResponse(data);
        } catch (error) {
            log.error("Error refresh access token", error);
            throw error;
        }
    }

    private _buildUrl(tenantId: string) {
        return `${this.app.azureEnvironment.aadUrl}/${tenantId}/oauth2/token`;
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

    private _options(): RequestInit {
        const headers = { "Content-Type": contentType };
        return { headers };
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
