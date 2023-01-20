import { AccessToken, DataStoreKeys, InMemoryDataStore } from "@batch-flask/core";
import { DateTime } from "luxon";
import { AccessTokenCache } from "./access-token-cache";

const tenant1 = "tenant-1";
const resource1 = "http://example.com";
const token1 = {
    accessToken: "sometoken",
    expiresOn: DateTime.local().plus({ hours: 1 }).toJSDate(),
    tokenType: "Bearer",
};

describe("AccessTokenCache", () => {
    let cache: AccessTokenCache;
    let localStorageSpy: InMemoryDataStore;

    it("should remove all tenant tokens when no resource specified", () => {
        cache = new AccessTokenCache();

        const accessToken = new AccessToken(token1);
        cache.storeToken("tenant1", null, accessToken);
        cache.storeToken("tenant1", "resource1", accessToken);
        cache.storeToken("tenant1", "resource2", accessToken);

        cache.storeToken("tenant2", null, accessToken);
        cache.storeToken("tenant2", "resource1", accessToken);
        cache.storeToken("tenant2", "resource2", accessToken);

        expect(cache.hasToken("tenant1", null)).toBeTruthy();
        expect(cache.hasToken("tenant1", "resource1")).toBeTruthy();
        expect(cache.hasToken("tenant1", "resource2")).toBeTruthy();
        cache.removeToken("tenant1");

        expect(cache.hasToken("tenant1", null)).toBeFalsy();
        expect(cache.hasToken("tenant1", "resource1")).toBeFalsy();
        expect(cache.hasToken("tenant1", "resource2")).toBeFalsy();

        cache.removeToken("tenant2", "resource1")
        expect(cache.hasToken("tenant2", null)).toBeTruthy();
        expect(cache.hasToken("tenant2", "resource1")).toBeFalsy();
        expect(cache.hasToken("tenant2", "resource2")).toBeTruthy();
    });

    describe("when using localstorage", () => {
        localStorageSpy = new InMemoryDataStore();
        beforeEach(() => {
            cache = new AccessTokenCache(localStorageSpy as any);
        });

        it("doesn't set the access token if not in localstorage", () => {
            localStorageSpy.removeItem(DataStoreKeys.currentAccessToken);
            cache.init();
            expect((cache as any)._tokens).toEqual({});
        });

        it("if token in local storage is expired it doesn't set it", () => {
            const token = {
                [tenant1]: {
                    [resource1]: {
                        accessToken: "sometoken",
                        expiresOn: DateTime.local().minus({ hours: 1 }).toJSDate(),
                    },
                },
            };
            localStorageSpy.setItem(DataStoreKeys.currentAccessToken, JSON.stringify(token));
            cache.init();
            expect(cache.getToken(tenant1, resource1)).toBeFalsy();
        });

        it("should load the token from local storage if present and not expired", async (done) => {
            const data = {
                [tenant1]: {
                    [resource1]: token1,
                },
            };
            localStorageSpy.setItem(DataStoreKeys.currentAccessToken, JSON.stringify(data));
            await cache.init();
            const token = cache.getToken(tenant1, resource1);
            expect(token).not.toBeFalsy();
            expect(token.accessToken).toEqual("sometoken");
            done();
        });
    });

    describe("without local storage(memory only)", () => {
        beforeEach(() => {
            cache = new AccessTokenCache(localStorageSpy as any);
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
