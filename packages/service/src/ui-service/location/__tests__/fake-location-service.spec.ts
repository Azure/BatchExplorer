import { initMockEnvironment } from "@batch/ui-common/lib/environment";
import { BasicFakeSet, FakeSet } from "../../test-util/fakes";
import { FakeLocationService } from "../fake-location-service";

describe("FakeLocationService", () => {
    const tanukiSubId = "00000000-0000-0000-0000-000000000000";

    let service: FakeLocationService;
    let fakeSet: FakeSet;

    beforeEach(() => {
        initMockEnvironment();
        fakeSet = new BasicFakeSet();
        service = new FakeLocationService();
        service.setFakes(fakeSet);
    });

    test("List by subscription", async () => {
        const locations = await service.listBySubscriptionId(tanukiSubId);
        expect(locations.map((location) => location.name)).toEqual([
            "eastus",
            "southcentralus",
        ]);
    });

    test("Get by resource ID", async () => {
        const location = await service.get(
            `/subscriptions/${tanukiSubId}/locations/eastus`
        );
        expect(location?.name).toEqual("eastus");
    });
});
