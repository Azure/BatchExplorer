import { exists } from "@batch-flask/utils";
import { DateTime } from "luxon";

/* eslint-disable @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match */

export interface AccessTokenAttributes {
    accessToken: string;
    tokenType: string;

    /**
     * Datetime when the token expires
     */
    expiresOn: Date;

    tenantId?: string;
    homeTenantId?: string;
    resource?: string;
}

export class AccessToken {
    public static isValidToken(data: AccessTokenAttributes) {
        return exists(data.accessToken)
            && exists(data.tokenType)
            && exists(data.expiresOn);
    }

    public accessToken: string;
    public tokenType: string;

    /**
     * Datetime when the token expires
     */
    public expiresOn: Date;

    public tenantId?: string;
    public homeTenantId?: string;
    public resource?: string;

    constructor(data: AccessTokenAttributes) {
        this.accessToken = data.accessToken;
        this.tokenType = data.tokenType;
        this.expiresOn = new Date(data.expiresOn);
        this.tenantId = data.tenantId;
        this.homeTenantId = data.homeTenantId;
        this.resource = data.resource;
    }

    /**
     * @return true if the token is going to expire in less than the specified number of milliseconds
     */
    public expireInLess(milliseconds: number): boolean {
        const expireIn = DateTime.fromJSDate(this.expiresOn).diff(DateTime.utc()).as("milliseconds");
        return expireIn < milliseconds;
    }

    public hasExpired(): boolean {
        return this.expireInLess(0);
    }

    public toHeader() {
        return `${this.tokenType} ${this.accessToken}`;
    }
}
