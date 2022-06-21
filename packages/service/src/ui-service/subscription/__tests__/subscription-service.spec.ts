import {
    getMockEnvironment,
    initMockEnvironment,
    MockHttpClient,
    MockHttpResponse,
} from "@batch/ui-common";
import { FakeSubscriptionService } from "../fake-subscription-service";

describe("SubscriptionService", () => {
    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockEnvironment();
        httpClient = getMockEnvironment().getHttpClient();
    });

    test("list()", async () => {
        const service = new FakeSubscriptionService();

        httpClient.addExpected(
            new MockHttpResponse("/subscriptions", 200, `["A", "B", "C", "D"]`)
        );
        const subs = await service.list();
        expect(subs.length).toEqual(4);
    });
});
