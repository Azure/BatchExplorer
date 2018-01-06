import { Response, ResponseOptions } from "@angular/http";
import { Observable, Subscription } from "rxjs";
import * as Fixtures from "test/fixture";

import { AuthorizationHttpService, BatchAccountPermission, Permission } from "./authorization-http.service";

describe("AuthorizationHttpService", () => {
    let authService: AuthorizationHttpService;
    let mockAuthResponse;
    let requestUrl;
    let mockNextLinkResponse = {
        body: JSON.stringify({
            value: [{
                actions: [BatchAccountPermission.Read],
                noactions: [],
            }],
        }),
    };
    let accountServiceSpy;
    let armServiceSpy;
    let subs: Subscription[] = [];

    beforeEach(() => {
        accountServiceSpy = {
            currentAccount: Observable.of(Fixtures.account.create({
                id: "myaccount",
            })),
        };

        armServiceSpy = {
            get: jasmine.createSpy("get").and.callFake((url, options) => {
                requestUrl = url;
                if (url === "fakeNextLink") {
                    return Observable.of(new Response(new ResponseOptions(mockNextLinkResponse)));
                }
                return Observable.of(new Response(new ResponseOptions(mockAuthResponse)));
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
            body: JSON.stringify({
                value: [{
                    actions: [BatchAccountPermission.Read],
                    noactions: [],
                }],
            }),
        };
        subs.push(authService.getResourcePermission().subscribe(response => {
            expect(requestUrl).toEqual("myaccount/providers/Microsoft.Authorization/permissions");
            expect(response).toEqual(Permission.Read);
        }));
    });

    it("should have all permission for this resource", () => {
        mockAuthResponse = {
            body: JSON.stringify({
                value: [{
                    actions: [BatchAccountPermission.Read, BatchAccountPermission.ReadWrite],
                    noactions: [],
                }],
            }),
        };
        subs.push(authService.getResourcePermission().subscribe(response => {
            expect(requestUrl).toEqual("myaccount/providers/Microsoft.Authorization/permissions");
            expect(response).toEqual(Permission.Write);
        }));
    });

    it("should recisively request authorization permissions if there is nextLink token in response body", () => {
        mockAuthResponse = {
            body: JSON.stringify({
                value: [{
                    actions: [BatchAccountPermission.ReadWrite],
                    noactions: [],
                }],
                nextLink: "fakeNextLink",
            }),
        };
        subs.push(authService.getResourcePermission().subscribe(response => {
            expect(requestUrl).toEqual("fakeNextLink");
            expect(response).toEqual(Permission.Write);
        }));
    });
});
