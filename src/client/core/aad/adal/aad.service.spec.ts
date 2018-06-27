import * as moment from "moment";

import { AccessToken } from "@batch-flask/core";
import { Constants } from "common";
import { F } from "test/utils";
import { mockNodeStorage } from "test/utils/mocks/storage";
import { MockBrowserWindow, MockSplashScreen } from "test/utils/mocks/windows";
import { AADUser } from "./aad-user";
import { AADService } from "./aad.service";

const tenant1 = "tenant1";
const resource1 = "http://example.com";

const sampleUser: AADUser = {
    aud: "94ef904d-c21a-4972-9244-b4d6a12b8e13",
    iss: "https://sts.windows.net/72f788bf-86f1-41af-21ab-2d7cd011db47/",
    iat: 1483372574,
    nbf: 1483372574,
    exp: 1483376474,
    amr: ["pwd", "mfa"],
    family_name: "Smith",
    given_name: "Frank",
    ipaddr: "198.217.117.26",
    name: "Frank Smith",
    nonce: "be4e7843-305e-42ab-988d-7ee109989d70",
    oid: "8a0of62c-3629-4619-abd4-8c2257a282be",
    platf: "5",
    sub: "0WzjD2jhHJVb-3h2PbwUDCJOIPPIJmQQYE832uFqiII",
    tid: "72f988bf-86f1-41af-91ab-2d7cd011db47",
    unique_name: "frank.smith@example.com",
    upn: "frank.smith@example.com",
    ver: "1.0",
};

describe("AADService", () => {
    let service: AADService;
    let currentUser: AADUser;
    let appSpy;
    const localStorage: any = {};
    let accessTokenCacheSpy;

    beforeEach(() => {
        accessTokenCacheSpy = {

        };
        appSpy = {
            mainWindow: new MockBrowserWindow(),
            splashScreen: new MockSplashScreen(),
        };
        mockNodeStorage(localStorage);
        service = new AADService(appSpy, localStorage, accessTokenCacheSpy);
        service.currentUser.subscribe(x => currentUser = x);
        service.init();
    });

    it("when there is no item in the localstorage it should not set the id_token", () => {
        localStorage.removeItem(Constants.localStorageKey.currentUser);
        const tmpService = new AADService(appSpy, localStorage, accessTokenCacheSpy);
        tmpService.init();
        let user: AADUser = null;
        tmpService.currentUser.subscribe(x => user = x);
        expect(user).toBeNull();
    });

    it("when localstorage has currentUser it should load it", async (done) => {
        await localStorage.setItem(Constants.localStorageKey.currentUser, JSON.stringify(sampleUser));
        const tmpService = new AADService(appSpy, localStorage, accessTokenCacheSpy);
        await tmpService.init();
        let user: AADUser = null;
        tmpService.currentUser.subscribe(x => user = x);
        expect(user).not.toBeNull();
        expect(user.upn).toEqual("frank.smith@example.com");
        done();
    });

    describe("accessTokenData", () => {
        let authorizeSpy: jasmine.Spy;
        let refreshSpy: jasmine.Spy;
        let redeemSpy: jasmine.Spy;
        let decodeSpy: jasmine.Spy;
        let refreshedToken;
        let newToken;
        let token: AccessToken;

        beforeEach(() => {
            refreshedToken = new AccessToken({
                access_token: "refreshedToken", expires_on: moment().add(1, "hour").toDate(),
            } as any);
            newToken = new AccessToken({ access_token: "newToken", expires_on: moment().add(1, "hour") } as any);
            const authorizeResult = {
                id_token: "someidtoken",
                code: "somecode",
            };

            refreshSpy = jasmine.createSpy("refreshSpy").and.returnValue(Promise.resolve(refreshedToken));
            redeemSpy = jasmine.createSpy("redeemSpy").and.returnValue(Promise.resolve(newToken));
            authorizeSpy = jasmine.createSpy("authorizeSpy").and.returnValue(Promise.resolve(authorizeResult));
            decodeSpy = jasmine.createSpy("decodeSpy").and.returnValue(sampleUser);

            (service as any)._accessTokenService.refresh = refreshSpy;
            (service as any)._accessTokenService.redeem = redeemSpy;
            (service as any).userAuthorization.authorizeTrySilentFirst = authorizeSpy;
            (service as any)._userDecoder.decode = decodeSpy;
        });

        it("should use the cached token if not expired", F(async () => {
            (service as any)._tokenCache.storeToken(tenant1, resource1, new AccessToken({
                access_token: "initialtoken",
                expires_on: moment().add(1, "hour"),
            } as any));
            token = await service.accessTokenData(tenant1, resource1);
            expect(token).not.toBeNull();
            expect(token.access_token).toEqual("initialtoken");
        }));

        it("should reload a new token if the token is expiring before the safe margin", F(async () => {
            (service as any)._tokenCache.storeToken(tenant1, resource1, new AccessToken({
                access_token: "initialtoken",
                expires_on: moment().add(1, "minute").toDate(),
                refresh_token: "somerefreshtoken",
            } as any));
            token = await service.accessTokenData(tenant1, resource1);
            expect(redeemSpy).not.toHaveBeenCalled();
            expect(refreshSpy).toHaveBeenCalledTimes(1);
            expect(refreshSpy).toHaveBeenCalledWith(resource1, tenant1, "somerefreshtoken");

            expect(token).not.toBeNull();
            expect(token.access_token).toEqual("refreshedToken");
        }));

        it("should load a new token if getting a token for another resource", async (done) => {
            (service as any)._tokenCache.storeToken(tenant1, resource1, new AccessToken({
                access_token: "initialtoken",
                expires_on: moment().add(1, "hour"),
            } as any));
            token = await service.accessTokenData(tenant1, "http://other-resource.com");
            expect(redeemSpy).toHaveBeenCalled();
            expect(redeemSpy).toHaveBeenCalledWith("http://other-resource.com", tenant1, "somecode");
            expect(refreshSpy).not.toHaveBeenCalled();

            expect(token).not.toBeNull();
            expect(token.access_token).toEqual("newToken");
            done();
        });

        it("should load a new token if getting a token for another tenant", async (done) => {
            (service as any)._tokenCache.storeToken(tenant1, resource1, new AccessToken({
                access_token: "initialtoken",
                expires_on: moment().add(1, "hour"),
            } as any));
            token = await service.accessTokenData("tenant-2", resource1);
            expect(redeemSpy).toHaveBeenCalled();
            expect(redeemSpy).toHaveBeenCalledWith(resource1, "tenant-2", "somecode");
            expect(refreshSpy).not.toHaveBeenCalled();

            expect(token).not.toBeNull();
            expect(token.access_token).toEqual("newToken");
            done();
        });

        describe("when there is no token cached", () => {
            beforeEach(async (done) => {
                token = await service.accessTokenData(tenant1, resource1);
                done();
            });

            it("should authorize the user", () => {
                expect(authorizeSpy).toHaveBeenCalledTimes(1);
                expect(decodeSpy).toHaveBeenCalledTimes(1);
                expect(decodeSpy).toHaveBeenCalledWith("someidtoken");
            });

            it("should save the user inside localStorage", async (done) => {
                const data = await localStorage.getItem(Constants.localStorageKey.currentUser);
                expect(data).toEqual(JSON.stringify(sampleUser));
                done();
            });

            it("should redeem a new token", () => {
                expect(refreshSpy).not.toHaveBeenCalled();
                expect(redeemSpy).toHaveBeenCalledTimes(1);
                expect(redeemSpy).toHaveBeenCalledWith(resource1, tenant1, "somecode");
                expect(token.access_token).toEqual("newToken");
            });
        });

    });
});
