import * as moment from "moment";

import { AccessToken } from "app/services/adal";

describe("AccessToken", () => {
    it("Should expires in less", () => {
        const token = new AccessToken({
            access_token: "sometoken",
            expires_on: moment().add(1, "h").toDate(),
        });
        expect(token.expireInLess(1000 * 120)).toBe(false);
        expect(token.expireInLess(1000 * 3600)).toBe(true);
        expect(token.expireInLess(1000 * 3600 * 2)).toBe(true);
    });

    it("Should not be expired if expires_in is later", () => {
        const token = new AccessToken({
            access_token: "sometoken",
            expires_on: moment().add(1, "minute").toDate(),
        });
        expect(token.hasExpired()).toBe(false);
    });

    it("Should be exipred if in the past", () => {
        const token1 = new AccessToken({ expires_on: moment().subtract(1, "seconds").toDate() });
        const token2 = new AccessToken({ expires_on: moment().subtract(1, "minute").toDate() });
        expect(token1.hasExpired()).toBe(true);
        expect(token2.hasExpired()).toBe(true);
    });
});
