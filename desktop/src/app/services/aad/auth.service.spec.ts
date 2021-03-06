import { AccessToken, ServerError } from "@batch-flask/core";
import { AuthService } from "app/services/aad";
import { DateTime } from "luxon";
import { BehaviorSubject } from "rxjs";

const tenant1 = "tenant-1";
const resource1 = "batch";
const token1 = new AccessToken({
    access_token: "sometoken",
    expires_on: DateTime.local().plus({ hours: 1 }).toJSDate(),
    expires_in: 3600,
    token_type: "Bearer",
    ext_expires_in: 3600,
    not_before: DateTime.local().plus({ hours: 1 }).toJSDate(),
    refresh_token: "foorefresh",
});

describe("AuthService spec", () => {
    let service: AuthService;
    let aadServiceSpy;
    let remoteSpy;
    let batchExplorerSpy;
    let notificationServiceSpy;
    let zoneSpy;

    beforeEach(() => {
        aadServiceSpy = {
            tenants: new BehaviorSubject([]),
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
        service = new AuthService(zoneSpy, batchExplorerSpy, remoteSpy, notificationServiceSpy);
    });

    afterEach(() => {
        aadServiceSpy.tenants.complete();
        service.ngOnDestroy();
    });

    it("raises an error when tenants cannot be fetched", () => {
        const nextSpy = jasmine.createSpy("next");
        const errorSpy = jasmine.createSpy("error");
        service.tenants.subscribe(nextSpy, errorSpy);
        aadServiceSpy.tenants.error(new ServerError({
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
        it("load a new token by calling aadService", async () => {
            const token = await service.accessTokenDataAsync(tenant1, resource1);
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(token).toEqual(token1);
        });

        it("load a new token by calling aadService", async () => {
            const tokenA = await service.accessTokenDataAsync(tenant1, resource1);
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(tokenA).toEqual(token1);
            const tokenB = await service.accessTokenDataAsync(tenant1, resource1);
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(tokenB).toEqual(token1);
        });

        it("cache the promise so it doesn't call the main process twice", async () => {
            const promiseA = service.accessTokenDataAsync(tenant1, resource1);
            const promiseB = service.accessTokenDataAsync(tenant1, resource1);
            const [tokenA, tokenB] = await Promise.all([promiseA, promiseB]);
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(tokenA).toEqual(token1);
            expect(tokenB).toEqual(token1);
        });

        it("calls again the main process if previous call returned an error", async () => {
            remoteSpy.send = jasmine.createSpy("send").and.returnValues(
                Promise.reject("some-error"),
                Promise.resolve(token1),
            );
            try {
                await service.accessTokenDataAsync(tenant1, resource1);
                fail("First call to accessTokenDataAsync shouldn't have succeeded");
            } catch (e) {
                expect(remoteSpy.send).toHaveBeenCalledTimes(1);
                expect(e).toEqual("some-error");
            }

            try {
                const token = await service.accessTokenDataAsync(tenant1, resource1);
                expect(remoteSpy.send).toHaveBeenCalledTimes(2);
                expect(token).toEqual(token1);
            } catch (e) {
                fail(`Second call to accessTokenDataAsync should have succeeded [err=${e}]`);
            }
        });
    });

    it("updates the tenants when updated by the auth service", () => {
        let tenants;
        service.tenants.subscribe(x => tenants = x);
        expect(zoneSpy.run).toHaveBeenCalledTimes(1);
        aadServiceSpy.tenants.next(["foo-1", "foo-2"]);
        expect(zoneSpy.run).toHaveBeenCalledTimes(2);
        expect(tenants).toEqual(["foo-1", "foo-2"]);
    });
});
