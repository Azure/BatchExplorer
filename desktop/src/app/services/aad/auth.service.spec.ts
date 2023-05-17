import { TestBed } from "@angular/core/testing";
import { AccessToken, I18nService, ServerError, TenantSettingsService } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { AuthService, TenantAuthorization } from "app/services/aad";
import { IpcEvent } from "common/constants";
import { DateTime } from "luxon";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { TenantErrorService } from ".";

const FakeTenants = {
    One: "tenant-1",
    Two: "tenant-2",
    Three: "tenant-3",
};
const resource1 = "batch";
const token1 = new AccessToken({
    accessToken: "sometoken",
    expiresOn: DateTime.local().plus({ hours: 1 }).toJSDate(),
    tokenType: "Bearer"
});
const token2 = new AccessToken({
    accessToken: "anothertoken",
    expiresOn: DateTime.local().plus({ hours: 1 }).toJSDate(),
    tokenType: "Bearer"
});

describe("AuthService spec", () => {
    let service: AuthService;
    let aadServiceSpy;
    let remoteSpy;
    let batchExplorerSpy;
    let notificationServiceSpy;
    let zoneSpy;
    let tenantSettingsServiceSpy;
    let tenantErrorServiceSpy;

    beforeEach(() => {
        aadServiceSpy = {
            tenants: new BehaviorSubject(
                Object.values(FakeTenants).map(t => ({ tenantId: t }))
            ),
            currentUser: new BehaviorSubject([]),
        };
        remoteSpy = {
            send: jasmine.createSpy("accessTokenData").and.returnValues(
                Promise.resolve(token1),
                Promise.resolve(token2)
            ),
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

        tenantSettingsServiceSpy = {
            current: new BehaviorSubject({
                tenantX: "active"
            })
        };

        tenantErrorServiceSpy = {
            showError: jasmine.createSpy("tenantErrorService.showError")
        };

        TestBed.configureTestingModule({
            imports: [I18nTestingModule],
            providers: [
                {
                    provide: TenantSettingsService,
                    useValue: tenantSettingsServiceSpy
                },
                {
                    provide: TenantErrorService,
                    useValue: tenantErrorServiceSpy
                }
            ]
        });

        service = new AuthService(
            zoneSpy,
            batchExplorerSpy,
            remoteSpy,
            notificationServiceSpy,
            TestBed.inject(TenantSettingsService),
            TestBed.inject(I18nService),
            TestBed.inject(TenantErrorService)
        );
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
        service.accessTokenFor(FakeTenants.One, resource1)
            .subscribe((token) => {
                expect(remoteSpy.send).toHaveBeenCalledOnce();
                expect(token).toEqual(token1.accessToken);
                done();
            });
    });

    describe("getAccessToken()", () => {
        it("should call accessTokenData with defaults", () => {
            spyOn(service, "accessTokenData").and.returnValue(new Observable());
            const promise = service.getAccessToken("someTenant");
            expect(service.accessTokenData)
                .toHaveBeenCalledWith("someTenant", null, false);
            expect(promise).toBeDefined();
        });
    });

    describe("#accessTokenData", () => {
        it("#accessTokenData returns observable with token", done => {
            service.accessTokenData(FakeTenants.One, resource1)
                .subscribe((token) => {
                    expect(remoteSpy.send).toHaveBeenCalledOnce();
                    expect(token).toEqual(token1);
                    done();
                });
        });

        it("loads a new token by calling aadService", done => {
            combineLatest([
                service.accessTokenData(FakeTenants.One, resource1),
                service.accessTokenData(FakeTenants.Two, resource1)
            ]).subscribe(([tokenA, tokenB]) => {
                expect(remoteSpy.send).toHaveBeenCalledTimes(2);
                expect(tokenA).toEqual(token1);
                expect(tokenB).toEqual(token2);
                done();
            });
        });

        it("reuses remote calls for same tenant", done => {
            combineLatest([
                service.accessTokenData(FakeTenants.One, resource1),
                service.accessTokenData(FakeTenants.Two, resource1),
                service.accessTokenData(FakeTenants.One, resource1)
            ]).subscribe(([tokenA, tokenB, tokenC]) => {
                expect(remoteSpy.send).toHaveBeenCalledTimes(2);
                expect(remoteSpy.send.calls.allArgs()).toEqual([
                    [
                        IpcEvent.AAD.accessTokenData,
                        {
                            tenantId: FakeTenants.One, resource: resource1,
                            forceRefresh: false
                        }
                    ],
                    [
                        IpcEvent.AAD.accessTokenData,
                        {
                            tenantId: FakeTenants.Two, resource: resource1,
                            forceRefresh: false
                        }
                    ]
                ]);
                expect(tokenA).toEqual(token1);
                expect(tokenB).toEqual(token2);
                expect(tokenC).toEqual(token1);
                done();
            });
        });

        it("calls again the main process if previous call returned an error",
            async () => {
                remoteSpy.send = jasmine.createSpy("send").and.returnValues(
                    Promise.reject("some-error"),
                    Promise.resolve(token1),
                );

                await new Promise<void>(resolve => {
                    service.accessTokenData(FakeTenants.One, resource1).subscribe({
                        next: () => fail("Should not have a next() call"),
                        error: error => {
                            expect(error).toEqual("some-error");
                            resolve();
                        }
                    });
                });

                await new Promise<void>(resolve => {
                    service.accessTokenData(FakeTenants.One, resource1).subscribe({
                        next: token => {
                            expect(token).toEqual(token1);
                            resolve();
                        }
                    });
                });
                expect(remoteSpy.send).toHaveBeenCalledTimes(2);
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

    describe("getTenantAuthorizations", () => {
        function auth(opts?): Promise<TenantAuthorization[]> {
            return new Promise(resolve => {
                service.getTenantAuthorizations(opts).subscribe(
                    authorizations => resolve(authorizations)
                );
            });
        }
        it("notifies on error by default", async () => {
            remoteSpy.send.and.callFake(async (_, { tenantId }) => {
                if (tenantId === FakeTenants.One) {
                    throw new Error("Fake error for tenant-1");
                } else {
                    return token2;
                }
            });
            tenantSettingsServiceSpy.current.next({
                [FakeTenants.One]: "active"
            });
            const authorizations = await auth();
            expect(tenantErrorServiceSpy.showError).toHaveBeenCalledOnce();
            expect(tenantErrorServiceSpy.showError).toHaveBeenCalledWith(
                authorizations[0]
            );
        });
        it("skips inactive tenants", async () => {
            tenantSettingsServiceSpy.current.next({
                [FakeTenants.One]: "inactive",
                [FakeTenants.Two]: "active"
            });
            const authorizations = await auth();
            expect(authorizations.length).toEqual(3);
            expect(authorizations[0].tenant.tenantId)
                .toEqual(FakeTenants.One);
            expect(authorizations[0].active).toBeFalsy();
            expect(authorizations[1].tenant.tenantId)
                .toEqual(FakeTenants.Two);
            expect(authorizations[1].active).toBeTruthy();
            expect(authorizations[2].tenant.tenantId)
                .toEqual(FakeTenants.Three);
            expect(authorizations[2].active).toBeFalsy();
        });
        it("assumes unconfigured tenants are inactive", async () => {
            tenantSettingsServiceSpy.current.next({});
            const authorizations = await auth();
            expect(authorizations.length).toEqual(3);
            expect(authorizations[0].active).toBeFalsy();
            expect(authorizations[1].active).toBeFalsy();
            expect(authorizations[2].active).toBeFalsy();
        });
        it("forces refresh on specific tenant reauthentication", async () => {
            tenantSettingsServiceSpy.current.next({
                [FakeTenants.One]: "active",
                [FakeTenants.Two]: "active"
            });
            await auth({ reauthenticate: FakeTenants.One });
            expect(remoteSpy.send).toHaveBeenCalledWith(
                IpcEvent.AAD.accessTokenData, {
                tenantId: FakeTenants.One,
                resource: null,
                forceRefresh: true
            });
            expect(remoteSpy.send).toHaveBeenCalledWith(
                IpcEvent.AAD.accessTokenData, {
                tenantId: FakeTenants.Two,
                resource: null,
                forceRefresh: false
            });
        });
        it("force-refreshes on all tenants", async () => {
            tenantSettingsServiceSpy.current.next({
                [FakeTenants.One]: "active",
                [FakeTenants.Two]: "active"
            });
            await auth({ reauthenticate: "*" });
            expect(remoteSpy.send).toHaveBeenCalledWith(
                IpcEvent.AAD.accessTokenData, {
                tenantId: FakeTenants.One,
                resource: null,
                forceRefresh: true
            });
            expect(remoteSpy.send).toHaveBeenCalledWith(
                IpcEvent.AAD.accessTokenData, {
                tenantId: FakeTenants.Two,
                resource: null,
                forceRefresh: true
            });
        });
        it("doesn't refresh failure when reauthenticating all", async () => {
            tenantSettingsServiceSpy.current.next({
                [FakeTenants.One]: "active",
                [FakeTenants.Two]: "active"
            });
            remoteSpy.send.and.callFake(async (_, { tenantId }) => {
                if (tenantId === FakeTenants.One) {
                    throw new Error("Fake error for tenant-1");
                } else {
                    return token2;
                }
            });
            await auth(); // First call results in failure
            remoteSpy.send.calls.reset();
            await auth({ reauthenticate: "*" });
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(remoteSpy.send).toHaveBeenCalledWith(
                IpcEvent.AAD.accessTokenData, {
                tenantId: FakeTenants.Two,
                resource: null,
                forceRefresh: true
            });
        });
    });
});
