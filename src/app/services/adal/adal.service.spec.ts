import * as moment from "moment";

import { AccessToken, ServerError } from "@batch-flask/core";
import { AdalService } from "app/services/adal";
import { BehaviorSubject } from "rxjs";
import { F } from "test/utils";

const tenant1 = "tenant-1";
const resource1 = "http://example.com";
const token1 = new AccessToken({
    access_token: "sometoken",
    expires_on: moment().add(1, "hour").toDate(),
    expires_in: 3600,
    token_type: "Bearer",
    ext_expires_in: 3600,
    not_before: moment().add(1, "hour").toDate(),
    refresh_token: "foorefresh",
});

describe("AdalService spec", () => {
    let service: AdalService;
    let aadServiceSpy;
    let remoteSpy;
    let batchExplorerSpy;
    let notificationServiceSpy;
    let zoneSpy;

    beforeEach(() => {
        aadServiceSpy = {
            tenantsIds: new BehaviorSubject([]),
            currentUser: new BehaviorSubject([]),
        };
        remoteSpy = {
            send: jasmine.createSpy("accessTokenData").and.returnValue(Promise.resolve(token1)),
        };
        batchExplorerSpy = {
            aadService: aadServiceSpy,
        };

        notificationServiceSpy = {
            error: jasmine.createSpy("notify.error"),
        };

        zoneSpy = {
            run: jasmine.createSpy("zone.run").and.callFake(callback => callback()),
        };
        service = new AdalService(zoneSpy, batchExplorerSpy, remoteSpy, notificationServiceSpy);
    });

    afterEach(() => {
        aadServiceSpy.tenantsIds.complete();
        service.ngOnDestroy();
    });

    it("It notify of error if tenants ids fail", () => {
        const nextSpy = jasmine.createSpy("next");
        const errorSpy = jasmine.createSpy("error");
        service.tenantsIds.subscribe(nextSpy, errorSpy);
        aadServiceSpy.tenantsIds.error(new ServerError({
            status: 300,
            code: "ERRNOCONN",
            statusText: "ERRNOCONN",
            message: "Cannot connect",
        }));

        expect(notificationServiceSpy.error).toHaveBeenCalledOnce();
        expect(notificationServiceSpy.error).toHaveBeenCalledWith(
            "Error loading tenants. This could be an issue with proxy settings or your connection.",
            "300 - ERRNOCONN - Cannot connect");

        expect(errorSpy).toHaveBeenCalledOnce();
    });

    it("#accessTokenFor returns observable with token string", (done) => {
        service.accessTokenFor(tenant1, resource1).subscribe((token) => {
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(token).toEqual(token1.access_token);
            done();
        });
    });

    it("#accessTokenData returns observable with token", (done) => {
        service.accessTokenData(tenant1, resource1).subscribe((token) => {
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(token).toEqual(token1);
            done();
        });
    });

    describe("#accessTokenDataAsync", () => {
        it("load a new token by calling aadService", F(async () => {
            const token = await service.accessTokenDataAsync(tenant1, resource1);
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(token).toEqual(token1);
        }));

        it("load a new token by calling aadService", F(async () => {
            const tokenA = await service.accessTokenDataAsync(tenant1, resource1);
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(tokenA).toEqual(token1);
            const tokenB = await service.accessTokenDataAsync(tenant1, resource1);
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(tokenB).toEqual(token1);
        }));

        it("cache the promise so it doesn't call the main process twice", F(async () => {
            const promiseA = service.accessTokenDataAsync(tenant1, resource1);
            const promiseB = service.accessTokenDataAsync(tenant1, resource1);
            const [tokenA, tokenB] = await Promise.all([promiseA, promiseB]);
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(tokenA).toEqual(token1);
            expect(tokenB).toEqual(token1);
        }));
    });

    it("updates the tenants ids when updated by the adal service", () => {
        let tenantIds;
        service.tenantsIds.subscribe(x => tenantIds = x);
        expect(zoneSpy.run).toHaveBeenCalledTimes(1);
        aadServiceSpy.tenantsIds.next(["foo-1", "foo-2"]);
        expect(zoneSpy.run).toHaveBeenCalledTimes(2);
        expect(tenantIds).toEqual(["foo-1", "foo-2"]);
    });
});
