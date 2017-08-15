import * as moment from "moment";

import { Model, Prop, Record } from "app/core";
import { exists } from "app/utils";

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

@Model()
export class AccessToken extends Record<AccessTokenAttributes> {
    public static isValidToken(data: AccessTokenAttributes) {
        return exists(data.access_token)
            && exists(data.refresh_token)
            && exists(data.token_type)
            && exists(data.expires_in)
            && exists(data.expires_on)
            && exists(data.ext_expires_in)
            && exists(data.not_before);
    }

    @Prop() public access_token: string;
    @Prop() public refresh_token: string = "Bearer";
    @Prop() public token_type: string;

    /**
     * Number of seconds before the token expires
     */
    @Prop() public expires_in: number;

    /**
     * Datetime when the token expires
     */
    @Prop() public expires_on: Date;

    @Prop() public ext_expires_in: number;
    @Prop() public not_before: Date;

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
