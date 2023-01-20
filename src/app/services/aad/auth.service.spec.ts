import { TestBed } from "@angular/core/testing";
import { AccessToken, I18nService, ServerError, TenantSettingsService } from "@batch-flask/core";
import { AuthService } from "app/services/aad";
import { IpcEvent } from "common/constants";
import { DateTime } from "luxon";
import { BehaviorSubject, combineLatest } from "rxjs";
import { TenantErrorService } from ".";

const tenant1 = "tenant-1";
const tenant2 = "tenant-2";
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
            tenants: new BehaviorSubject([
                { tenantId: tenant1 }, { tenantId: tenant2 }
            ]),
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
            providers: [
                {
                    provide: I18nService,
                    useValue: {
                        t: jasmine.createSpy()
                    }
                },
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
        service.accessTokenFor(tenant1, resource1).subscribe((token) => {
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(token).toEqual(token1.accessToken);
            done();
        });
    });

    describe("#accessTokenData", () => {
        it("#accessTokenData returns observable with token", done => {
            service.accessTokenData(tenant1, resource1).subscribe((token) => {
                expect(remoteSpy.send).toHaveBeenCalledOnce();
                expect(token).toEqual(token1);
                done();
            });
        });

        it("loads a new token by calling aadService", done => {
            combineLatest([
                service.accessTokenData(tenant1, resource1),
                service.accessTokenData(tenant2, resource1)
            ]).subscribe(([tokenA, tokenB]) => {
                expect(remoteSpy.send).toHaveBeenCalledTimes(2);
                expect(tokenA).toEqual(token1);
                expect(tokenB).toEqual(token2);
                done();
            });
        });

        it("reuses remote calls for same tenant", done => {
            combineLatest([
                service.accessTokenData(tenant1, resource1),
                service.accessTokenData(tenant2, resource1),
                service.accessTokenData(tenant1, resource1)
            ]).subscribe(([tokenA, tokenB, tokenC]) => {
                expect(remoteSpy.send).toHaveBeenCalledTimes(2);
                expect(remoteSpy.send.calls.allArgs()).toEqual([
                    [
                        IpcEvent.AAD.accessTokenData,
                        { tenantId: tenant1, resource: resource1,
                            forceRefresh: false }
                    ],
                    [
                        IpcEvent.AAD.accessTokenData,
                        { tenantId: tenant2, resource: resource1,
                            forceRefresh: false }
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
                service.accessTokenData(tenant1, resource1).subscribe({
                    next: () => fail("Should not have a next() call"),
                    error: error => {
                        expect(error).toEqual("some-error");
                        resolve();
                    }
                });
            });

            await new Promise<void>(resolve => {
                service.accessTokenData(tenant1, resource1).subscribe({
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
        it("notifies on error by default", done => {
            remoteSpy.send.and.callFake(async (_, { tenantId }) => {
                if (tenantId === tenant1) {
                    throw new Error("Fake error for tenant-1");
                } else {
                    return token2;
                }
            });
            service.getTenantAuthorizations()
            .subscribe(authorizations => {
                expect(tenantErrorServiceSpy.showError).toHaveBeenCalledOnce();
                expect(tenantErrorServiceSpy.showError).toHaveBeenCalledWith(
                    authorizations[0]
                )
                done();
            });
        });
        it("skips inactive tenants", done => {
            tenantSettingsServiceSpy.current.next({
                "tenant-1": "inactive",
                "tenant-2": "active"
            });
            service.getTenantAuthorizations()
            .subscribe(authorizations => {
                expect(authorizations.length).toEqual(2);
                expect(authorizations[0].tenant.tenantId).toEqual("tenant-1");
                expect(authorizations[0].active).toBeFalsy();
                expect(authorizations[1].tenant.tenantId).toEqual("tenant-2");
                expect(authorizations[1].active).toBeTruthy();
                done();
            })
        });
        it("forces refresh on specific tenant reauthentication", done => {
            service.getTenantAuthorizations({ reauthenticate: tenant1 })
            .subscribe(() => {
                expect(remoteSpy.send).toHaveBeenCalledWith(
                    IpcEvent.AAD.accessTokenData, {
                        tenantId: tenant1,
                        resource: null,
                        forceRefresh: true
                    });
                expect(remoteSpy.send).toHaveBeenCalledWith(
                    IpcEvent.AAD.accessTokenData, {
                        tenantId: tenant2,
                        resource: null,
                        forceRefresh: false
                    },
                );
                done();
            })
        });
        it("force-refreshes on all tenants", done => {
            service.getTenantAuthorizations({ reauthenticate: "*" })
            .subscribe(() => {
                expect(remoteSpy.send).toHaveBeenCalledWith(
                    IpcEvent.AAD.accessTokenData, {
                        tenantId: tenant1,
                        resource: null,
                        forceRefresh: true
                    });
                expect(remoteSpy.send).toHaveBeenCalledWith(
                    IpcEvent.AAD.accessTokenData, {
                        tenantId: tenant2,
                        resource: null,
                        forceRefresh: true
                    },
                );
                done();
            })
        });
        it("doesn't force-refresh previous failure when reauthenticating all tenants", done => {
            remoteSpy.send.and.callFake(async (_, { tenantId }) => {
                if (tenantId === tenant1) {
                    throw new Error("Fake error for tenant-1");
                } else {
                    return token2;
                }
            });
            service.getTenantAuthorizations().subscribe(() => {
                remoteSpy.send.calls.reset();
                service.getTenantAuthorizations({ reauthenticate: "*" })
                .subscribe(() => {
                    expect(remoteSpy.send).toHaveBeenCalledOnce();
                    expect(remoteSpy.send).toHaveBeenCalledWith(
                        IpcEvent.AAD.accessTokenData, {
                            tenantId: tenant2,
                            resource: null,
                            forceRefresh: true
                        },
                    );
                    done();
                });
            });
        });
    });
});
