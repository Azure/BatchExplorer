import { initMockEnvironment, getMockEnvironment } from "../../environment";
import { MockHttpClient, MockHttpResponse } from "../../http";
import { ApiVersion } from "../../constants";
import { LiveSubscriptionService } from "../live-subscription-service";
import { SubscriptionService } from "../subscription-service";
import { getArmUrl } from "../../arm";

describe("LiveSubscriptionService", () => {
    let service: SubscriptionService;
    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockEnvironment();
        httpClient = getMockEnvironment().getHttpClient();
        service = new LiveSubscriptionService();
    });

    test("list()", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}/subscriptions?api-version=${ApiVersion.arm}`,
                {
                    status: 200,
                    body: JSON.stringify({
                        value: [
                            { id: "A" },
                            { id: "B" },
                            { id: "C" },
                            { id: "D" },
                        ],
                    }),
                }
            )
        );
        expect(await service.list()).toEqual([
            { id: "A" },
            { id: "B" },
            { id: "C" },
            { id: "D" },
        ]);
    });

    test("get()", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}/subscriptions/A?api-version=${ApiVersion.arm}`,
                {
                    status: 200,
                    body: JSON.stringify({ id: "A" }),
                }
            )
        );
        expect(await service.get("A")).toEqual({ id: "A" });
    });
});
