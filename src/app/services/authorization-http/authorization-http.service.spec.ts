import { Permission } from "@batch-flask/ui/permission";
import { Subscription, of } from "rxjs";
import { take } from "rxjs/operators";
import * as Fixtures from "test/fixture";
import { AuthorizationHttpService, BatchAccountPermission } from "./authorization-http.service";

describe("AuthorizationHttpService", () => {
    let authService: AuthorizationHttpService;
    let mockAuthResponse;
    let requestUrl;
    const mockNextLinkResponse = {
        value: [{
            actions: [BatchAccountPermission.Read],
            noactions: [],
        }],
    };
    let accountServiceSpy;
    let armServiceSpy;
    const subs: Subscription[] = [];

    beforeEach(() => {
        accountServiceSpy = {
            currentAccount: of(Fixtures.account.create({
                id: "myaccount",
            })),
        };

        armServiceSpy = {
            get: jasmine.createSpy("get").and.callFake((url, options) => {
                requestUrl = url;
                if (url === "fakeNextLink") {
                    return of(mockNextLinkResponse);
                }
                return of(mockAuthResponse);
            }),
        };
        authService = new AuthorizationHttpService(accountServiceSpy, armServiceSpy);
    });

    afterEach(() => {
        authService = null;
        subs.forEach(sub => sub.unsubscribe());
    });

    it("should only have read permission for this resource", () => {
        mockAuthResponse = {
            value: [{
                actions: [BatchAccountPermission.Read],
                noactions: [],
            }],
        };
        subs.push(authService.getResourcePermission().subscribe(response => {
            expect(requestUrl).toEqual("myaccount/providers/Microsoft.Authorization/permissions");
            expect(response).toEqual(Permission.Read);
        }));
    });

    it("should have all permission for this resource", () => {
        mockAuthResponse = {
            value: [{
                actions: [BatchAccountPermission.Read, BatchAccountPermission.ReadWrite],
                noactions: [],
            }],
        };
        subs.push(authService.getResourcePermission().subscribe(response => {
            expect(requestUrl).toEqual("myaccount/providers/Microsoft.Authorization/permissions");
            expect(response).toEqual(Permission.Write);
        }));
    });

    it("should recisively request authorization permissions if there is nextLink token in response body", () => {
        mockAuthResponse = {
                value: [{
                    actions: [BatchAccountPermission.ReadWrite],
                    noactions: [],
                }],
                nextLink: "fakeNextLink",
        };
        subs.push(authService.getResourcePermission().subscribe(response => {
            expect(requestUrl).toEqual("fakeNextLink");
            expect(response).toEqual(Permission.Write);
        }));
    });

    describe("#hasPermission", () => {
        let permission: Permission;
        beforeEach(() => {
            const getResourcePermissionSpy = jasmine.createSpy("getResourcePermission").and.callFake(() => {
                return of(permission);
            });
            authService.getResourcePermission = getResourcePermissionSpy;
        });

        it("returns TRUE when need write and has write access", () => {
            permission = Permission.Write;
            authService.hasPermission(Permission.Write).pipe(take(1)).subscribe(hasPermission => {
                expect(hasPermission).toBe(true);
            });
        });

        it("returns TRUE when need read and has read access", () => {
            permission = Permission.Read;
            authService.hasPermission(Permission.Read).pipe(take(1)).subscribe(hasPermission => {
                expect(hasPermission).toBe(true);
            });
        });

        it("returns TRUE when need read and has write access", () => {
            permission = Permission.Write;
            authService.hasPermission(Permission.Read).pipe(take(1)).subscribe(hasPermission => {
                expect(hasPermission).toBe(true);
            });
        });

        it("returns FALSE when need write and has read access", () => {
            permission = Permission.Read;
            authService.hasPermission(Permission.Write).pipe(take(1)).subscribe(hasPermission => {
                expect(hasPermission).toBe(false);
            });
        });
    });
});
