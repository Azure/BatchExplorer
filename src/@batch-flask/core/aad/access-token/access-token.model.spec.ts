import { DateTime } from "luxon";
import { AccessToken, AccessTokenAttributes } from "./access-token.model";

describe("AccessToken.model", () => {
    it("Should expires in less", () => {
        const token = new AccessToken({
            accessToken: "sometoken",
            expiresOn: DateTime.local().plus({ hours: 1 }).toJSDate(),
        } as any);
        expect(token.expireInLess(1000 * 120)).toBe(false);
        expect(token.expireInLess(1000 * 3600 + 1)).toBe(true);
        expect(token.expireInLess(1000 * 3600 * 2)).toBe(true);
    });

    it("Should not be expired if expiresOn is later", () => {
        const token = new AccessToken({
            accessToken: "sometoken",
            expiresOn: DateTime.local().plus({ minutes: 1 }).toJSDate(),
        } as any);
        expect(token.hasExpired()).toBe(false);
    });

    it("Should be exipred if in the past", () => {
        const token1 = new AccessToken({ expiresOn: DateTime.local().minus({ minutes: 1 }).toJSDate() } as any);
        const token2 = new AccessToken({ expiresOn: DateTime.local().minus({ seconds: 1 }).toJSDate() } as any);
        expect(token1.hasExpired()).toBe(true);
        expect(token2.hasExpired()).toBe(true);
    });

    it("should return false to valid if missing attributes", () => {
        const token1 = { accessToken: "abc", tokenType: "Bearer" };
        const token2: AccessTokenAttributes = {
            accessToken: "abc",
            tokenType: "Bearer",
            expiresOn: new Date()
        };

        expect(AccessToken.isValidToken(token1 as any)).toBe(false);
        expect(AccessToken.isValidToken(token2)).toBe(true);
    });
});
