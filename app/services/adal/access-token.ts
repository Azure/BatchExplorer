import { Record } from "immutable";
import * as moment from "moment";
import { exists } from "app/utils";

const AccessTokenRecord = Record({
    access_token: null,
    refresh_token: null,
    token_type: "Bearer",
    expires_in: null,
    expires_on: null,
    ext_expires_in: null,
    not_before: null,
});

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

export class AccessToken extends AccessTokenRecord {
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
    public refresh_token: string;
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
        super(data);
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
