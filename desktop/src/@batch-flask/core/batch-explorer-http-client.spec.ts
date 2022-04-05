import { TenantPlaceholders } from "client/core/aad/aad-constants";
import { of } from "rxjs";
import BatchExplorerHttpClient from "./batch-explorer-http-client";

fdescribe("BatchExplorerHttpClient", () => {
    let httpClient: BatchExplorerHttpClient;
    let fakeAuthService;
    let fakeSubscriptionService;
    let fakeFetchHttpClient;
    beforeEach(() => {
        fakeSubscriptionService = {
            get: jasmine.createSpy("get").and.returnValue(
                of({ tenantId: "myTenant" })
            )
        };
        fakeAuthService = {
            getAccessToken: jasmine.createSpy().and.returnValue(
                Promise.resolve({
                    accessToken: "token1",
                    tokenType: "Token1Type"
                })
            )
        };
        fakeFetchHttpClient = {
            fetch: jasmine.createSpy().and.returnValue(
                Promise.resolve("theResponse")
            )
        };
        httpClient = new BatchExplorerHttpClient(
            fakeAuthService,
            fakeSubscriptionService,
            fakeFetchHttpClient
        );
    });
    describe("fetch", () => {
        it("loads an access token for the specified sub", async () => {
            const response = await httpClient.fetch(
                "/subscriptions/deadbeef-deadbeef-deadbeef-deadbeef1");

            expect(fakeSubscriptionService.get).toHaveBeenCalledWith(
                "deadbeef-deadbeef-deadbeef-deadbeef1");
            expect(fakeAuthService.getAccessToken)
                .toHaveBeenCalledWith("myTenant");
            expect(response).not.toBeNull();
        });
        it("uses the default tenant when no sub in URL", async () => {
            const response = await httpClient.fetch("/subscriptions");

            expect(fakeAuthService.getAccessToken).toHaveBeenCalledWith(
                TenantPlaceholders.common);
            expect(fakeSubscriptionService.get).toHaveBeenCalledTimes(0);
            expect(fakeFetchHttpClient.fetch).toHaveBeenCalledWith(
                "/subscriptions",
                {
                    headers: {
                        Authorization: "Token1Type token1"
                    }
                }
            );
        });
    });
});
