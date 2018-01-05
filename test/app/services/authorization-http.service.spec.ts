import { Response, ResponseOptions } from "@angular/http";
import { Observable, Subscription } from "rxjs";
import * as Fixtures from "test/fixture";

import { AuthorizationHttpService } from "app/services";

describe("AuthorizationHttpService", () => {
    let authService: AuthorizationHttpService;
    let mockAuthResponse;
    let requestUrl;
    let mockNextLinkResponse = {
        body: JSON.stringify({
            value: [{
                actions: ["*/read"],
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
                    actions: ["*/read"],
                    noactions: [],
                }],
            }),
        };
        subs.push(authService.getResourcePermission().subscribe(response => {
            expect(requestUrl).toEqual("myaccount/providers/Microsoft.Authorization/permissions");
            expect(response).toEqual("read");
        }));
    });

    it("should have all permission for this resource", () => {
        mockAuthResponse = {
            body: JSON.stringify({
                value: [{
                    actions: ["*/read", "*"],
                    noactions: [],
                }],
            }),
        };
        subs.push(authService.getResourcePermission().subscribe(response => {
            expect(requestUrl).toEqual("myaccount/providers/Microsoft.Authorization/permissions");
            expect(response).toEqual("write");
        }));
    });

    it("should recisively request authorization permissions if there is nextLink token in response body", () => {
        mockAuthResponse = {
            body: JSON.stringify({
                value: [{
                    actions: ["*"],
                    noactions: [],
                }],
                nextLink: "fakeNextLink",
            }),
        };
        subs.push(authService.getResourcePermission().subscribe(response => {
            expect(requestUrl).toEqual("fakeNextLink");
            expect(response).toEqual("write");
        }));
    });
});
