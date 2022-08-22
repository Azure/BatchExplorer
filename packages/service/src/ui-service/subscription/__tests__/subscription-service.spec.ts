import {
    getMockEnvironment,
    initMockEnvironment,
    MockHttpClient,
    MockHttpResponse,
} from "@batch/ui-common";
import { SubscriptionServiceImpl } from "..";

describe("SubscriptionService", () => {
    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockEnvironment();
        httpClient = getMockEnvironment().getHttpClient();
    });

    test("list()", async () => {
        const service = new SubscriptionServiceImpl();

        httpClient.addExpected(
            new MockHttpResponse(
                "https://management.azure.com/subscriptions?api-version=2021-04-01",
                200,
                JSON.stringify({
                    value: [{ id: "A" }, { id: "B" }, { id: "C" }, { id: "D" }],
                })
            )
        );
        const subs = await service.list();
        expect(subs).toEqual([
            { id: "A" },
            { id: "B" },
            { id: "C" },
            { id: "D" },
        ]);
    });
});
