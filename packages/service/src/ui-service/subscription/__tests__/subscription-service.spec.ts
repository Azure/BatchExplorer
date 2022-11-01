import {
    initMockEnvironment,
    getMockEnvironment,
} from "@batch/ui-common/lib/environment";
import { MockHttpClient, MockHttpResponse } from "@batch/ui-common/lib/http";
import { SubscriptionServiceImpl } from "..";
import { Endpoints, ApiVersion } from "../../constants";

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
                `${Endpoints.arm}/subscriptions?api-version=${ApiVersion.arm}`,
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
