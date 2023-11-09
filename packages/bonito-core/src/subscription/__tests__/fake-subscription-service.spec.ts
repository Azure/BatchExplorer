import { initMockEnvironment } from "../../environment";
import { BasicFakeSet, FakeSet } from "../../test-util/fakes";
import { FakeSubscriptionService } from "../fake-subscription-service";

describe("FakeSubscriptionService", () => {
    const tanukiSubId = "00000000-0000-0000-0000-000000000000";

    let service: FakeSubscriptionService;
    let fakeSet: FakeSet;

    beforeEach(() => {
        initMockEnvironment();
        fakeSet = new BasicFakeSet();
        service = new FakeSubscriptionService();
        service.setFakes(fakeSet);
    });

    test("List subscriptions", async () => {
        const subscriptions = await service.list();
        expect(subscriptions.map((sub) => sub.displayName)).toEqual([
            "tanuki",
            "nekomata",
        ]);
    });

    test("Get by ID", async () => {
        const sub = await service.get(tanukiSubId);
        expect(sub?.displayName).toEqual("tanuki");
    });
});
