import { TenantPlaceholders } from "client/core/aad/aad-constants";
import BatchExplorerHttpClient from "./batch-explorer-http-client";

describe("BatchExplorerHttpClient", () => {
    let httpClient: BatchExplorerHttpClient;
    let fakeAuthService;
    let fakeFetchHttpClient;
    beforeEach(() => {
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
            fakeFetchHttpClient
        );
    });
    describe("fetch", () => {
        it("uses the default tenant when no sub in URL", async () => {
            const response = await httpClient.fetch("/subscriptions");

            expect(fakeAuthService.getAccessToken).toHaveBeenCalledWith(
                TenantPlaceholders.common);
            const [subscriptionUrl, requestProps] = fakeFetchHttpClient.fetch.calls.argsFor(0);
            expect(subscriptionUrl).toEqual("/subscriptions");
            expect(requestProps.headers.get('authorization')).toEqual("Token1Type token1");
        });
        it("uses the common tenant regardless of subscription in URL",
        async () => {
            const response = await httpClient.fetch(
                "/subscriptions/deadbeef-deadbeef-deadbeef-deadbeef1");

            expect(fakeAuthService.getAccessToken)
                .toHaveBeenCalledWith(TenantPlaceholders.common);
            expect(response).not.toBeNull();
        });
    });
});
