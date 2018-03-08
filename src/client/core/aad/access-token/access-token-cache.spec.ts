import * as moment from "moment";

import { AccessToken } from "@batch-flask/core";
import { localStorage } from "client/core/local-storage";
import { Constants } from "common";
import { mockNodeStorage } from "test/utils/mocks/storage";
import { AccessTokenCache } from "./access-token-cache";

const tenant1 = "tenant-1";
const resource1 = "http://example.com";
const token1 = {
    access_token: "sometoken",
    expires_on: moment().add(1, "hour").toDate(),
    expires_in: 3600,
    token_type: "Bearer",
    ext_expires_in: 3600,
    not_before: moment().add(1, "hour").toDate(),
    refresh_token: "foorefresh",
};

describe("AccessTokenCache", () => {
    let cache: AccessTokenCache;

    describe("when using localstorage", () => {
        beforeEach(() => {
            mockNodeStorage(localStorage);
            cache = new AccessTokenCache(localStorage);
        });

        it("doesn't set the access token if not in localstorage", () => {
            localStorage.removeItem(Constants.localStorageKey.currentAccessToken);
            cache.init();
            expect((cache as any)._tokens).toEqual({});
        });

        it("if token in local storage is expired it doesn't set it", () => {
            const token = {
                [tenant1]: {
                    [resource1]: { access_token: "sometoken", expires_on: moment().subtract(1, "hour") },
                },
            };
            localStorage.setItem(Constants.localStorageKey.currentAccessToken, JSON.stringify(token));
            cache.init();
            expect(cache.getToken(tenant1, resource1)).toBeFalsy();
        });

        it("should load the token from local storage if present and not expired", async (done) => {
            const data = {
                [tenant1]: {
                    [resource1]: token1,
                },
            };
            localStorage.setItem(Constants.localStorageKey.currentAccessToken, JSON.stringify(data));
            await cache.init();
            const token = cache.getToken(tenant1, resource1);
            expect(token).not.toBeFalsy();
            expect(token.access_token).toEqual("sometoken");
            done();
        });
    });

    describe("without local storage(memory only)", () => {
        beforeEach(() => {
            cache = new AccessTokenCache();
        });

        it("save and retrieve tokens", () => {
            expect(cache.getToken(tenant1, resource1)).toBeUndefined();
            const token = new AccessToken(token1);
            cache.storeToken(tenant1, resource1, token);
            expect(cache.getToken(tenant1, resource1)).toEqual(token);

            cache.clear();
            expect(cache.getToken(tenant1, resource1)).toBeUndefined();
        });
    });
});
