import * as moment from "moment";

import { exists } from "@batch-flask/utils";

// tslint:disable:variable-name

export interface AccessTokenAttributes {
    access_token: string;
    refresh_token: string;
    token_type: string;

    /**
     * Number of seconds before the token expires
     */
    expires_in: number;

    /**
     * Datetime when the token expires
     */
    expires_on: Date;

    ext_expires_in: number;
    not_before: Date;
}

export class AccessToken {
    public static isValidToken(data: AccessTokenAttributes) {
        return exists(data.access_token)
            && exists(data.refresh_token)
            && exists(data.token_type)
            && exists(data.expires_in)
            && exists(data.expires_on)
            && exists(data.ext_expires_in)
            && exists(data.not_before);
    }

    public access_token: string;
    public refresh_token: string = "Bearer";
    public token_type: string;

    /**
     * Number of seconds before the token expires
     */
    public expires_in: number;

    /**
     * Datetime when the token expires
     */
    public expires_on: Date;

    public ext_expires_in: number;
    public not_before: Date;

    constructor(data: AccessTokenAttributes) {
        this.access_token = data.access_token;
        this.refresh_token = data.refresh_token;
        this.token_type = data.token_type;
        this.expires_in = data.expires_in;
        this.expires_on = data.expires_on;
        this.ext_expires_in = data.ext_expires_in;
        this.not_before = data.not_before;
    }

    /**
     * @return true if the token is going to expire in less than the specified number of milliseconds
     */
    public expireInLess(milliseconds: number): boolean {
        const expireIn = moment(this.expires_on).diff(moment());
        return expireIn < milliseconds;
    }

    public hasExpired(): boolean {
        return this.expireInLess(0);
    }
}
