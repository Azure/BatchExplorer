import * as moment from "moment";

import { ADUser } from "app/models";
import { AdalService } from "app/services/adal";
import { Constants } from "app/utils";
import { mockStorage } from "test/utils/mocks";

const sampleUser: ADUser = {
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

fdescribe("AdalService", () => {
    let service: AdalService;
    let http: any = {};
    let currentUser: ADUser;
    const config = { tenant: "common", clientId: "abc", redirectUri: "http://localhost" };

    beforeEach(() => {
        mockStorage(localStorage);
        service = new AdalService(http);
        service.init(config);
    });

    it("when there is no item in the localstorage it should not set the id_token", () => {
        localStorage.removeItem(Constants.localStorageKey.currentUser);
        const tmpService = new AdalService(http);
        tmpService.init(config);
        let user: ADUser = null;
        tmpService.currentUser.subscribe((x) => { user = x; });
        expect(user).toBeNull();
    });

    it("when localstorage has currentUser it should load it", () => {
        localStorage.setItem(Constants.localStorageKey.currentUser, JSON.stringify(sampleUser));
        const tmpService = new AdalService(http);
        tmpService.init(config);
        let user: ADUser = null;
        tmpService.currentUser.subscribe((x) => { user = x; });
        expect(user).not.toBeNull();
        expect(user.upn).toEqual("frank.smith@example.com");
    });

    it("doesn't set the access token if not in localstorage", () => {
        localStorage.removeItem(Constants.localStorageKey.currentAccessToken);
        const tmpService = new AdalService(http);
        tmpService.init(config);
        expect((<any>tmpService)._currentAccessToken).toBeNull();
    });

    it("if token in local storage is expired it doesn't set it", () => {
        const token = { access_token: "sometoken", expires_on: moment().subtract(1, "hour") };
        localStorage.setItem(Constants.localStorageKey.currentAccessToken, JSON.stringify(token));
        const tmpService = new AdalService(http);
        tmpService.init(config);
        expect((<any>tmpService)._currentAccessToken).toBeNull();
    });

    it("should load the token from local storage if present and not expired", () => {
        const token = { access_token: "sometoken", expires_on: moment().add(1, "hour") };
        localStorage.setItem(Constants.localStorageKey.currentAccessToken, JSON.stringify(token));
        const tmpService = new AdalService(http);
        tmpService.init(config);
        expect((<any>tmpService)._currentAccessToken).not.toBeNull();
        expect((<any>tmpService)._currentAccessToken.access_token).toEqual("sometoken");
    });
});
