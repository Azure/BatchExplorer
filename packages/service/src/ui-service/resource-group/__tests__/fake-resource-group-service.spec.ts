import { initMockEnvironment } from "@batch/ui-common/lib/environment";
import { BasicFakeSet, FakeSet } from "../../test-util/fakes";
import { FakeResourceGroupService } from "../fake-resource-group-service";

describe("FakeResourceGroupService", () => {
    const tanukiSubId = "00000000-0000-0000-0000-000000000000";
    const vizRgId =
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/visualization";

    let service: FakeResourceGroupService;
    let fakeSet: FakeSet;

    beforeEach(() => {
        initMockEnvironment();
        fakeSet = new BasicFakeSet();
        service = new FakeResourceGroupService();
        service.setFakes(fakeSet);
    });

    test("List by subscription", async () => {
        const resourceGroups = await service.listBySubscriptionId(tanukiSubId);
        expect(resourceGroups.map((rg) => rg.name)).toEqual([
            "supercomputing",
            "visualization",
        ]);
    });

    test("Get by resource ID", async () => {
        const rg = await service.get(vizRgId);
        expect(rg?.name).toEqual("visualization");
    });
});
