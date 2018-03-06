import * as moment from "moment";

import { AccessToken, AccessTokenAttributes } from "./access-token.model";

describe("AccessToken.model", () => {
    it("Should expires in less", () => {
        const token = new AccessToken({
            access_token: "sometoken",
            expires_on: moment().add(1, "h").toDate(),
        } as any);
        expect(token.expireInLess(1000 * 120)).toBe(false);
        expect(token.expireInLess(1000 * 3600 + 1)).toBe(true);
        expect(token.expireInLess(1000 * 3600 * 2)).toBe(true);
    });

    it("Should not be expired if expires_in is later", () => {
        const token = new AccessToken({
            access_token: "sometoken",
            expires_on: moment().add(1, "minute").toDate(),
        } as any);
        expect(token.hasExpired()).toBe(false);
    });

    it("Should be exipred if in the past", () => {
        const token1 = new AccessToken({ expires_on: moment().subtract(1, "seconds").toDate() } as any);
        const token2 = new AccessToken({ expires_on: moment().subtract(1, "minute").toDate() } as any);
        expect(token1.hasExpired()).toBe(true);
        expect(token2.hasExpired()).toBe(true);
    });

    it("should return false to valid if missing attributes", () => {
        const token1 = { access_token: "abc", expires_in: 3600, token_type: "Bearer" };
        const token2 = { access_token: "abc", expires_in: 3600, token_type: "Bearer", refresh_token: "foo" };
        const token3: AccessTokenAttributes = {
            access_token: "abc",
            expires_in: 3600,
            token_type: "Bearer",
            expires_on: new Date(),
            ext_expires_in: 3600,
            not_before: new Date(),
            refresh_token: "foo",
        };

        expect(AccessToken.isValidToken(token1 as any)).toBe(false);
        expect(AccessToken.isValidToken(token2 as any)).toBe(false);
        expect(AccessToken.isValidToken(token3)).toBe(true);
    });
});
