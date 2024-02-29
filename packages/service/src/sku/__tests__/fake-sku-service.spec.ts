import { initMockBatchEnvironment } from "../../environment";
import {
    BasicBatchFakeSet,
    BatchFakeSet,
    FakeLocations,
} from "../../test-util/fakes";
import { FakeSkuService } from "../fake-sku-service";
import { SupportedSkuType } from "../sku-models";

describe("FakeSkuService", () => {
    let fakeSet: BatchFakeSet;
    let service: FakeSkuService;

    beforeEach(() => {
        initMockBatchEnvironment();
        fakeSet = new BasicBatchFakeSet();
        service = new FakeSkuService();
        service.setFakes(fakeSet);
    });

    test("List by type", async () => {
        const skus = await service.list({
            subscriptionId: "00000000-0000-0000-0000-000000000000",
            type: SupportedSkuType.CloudService,
            locationName: FakeLocations.Arrakis.name,
        });
        expect(skus.length).toEqual(2);
        expect(skus[1].name).toEqual("A7");
        expect(skus[1].batchSupportEndOfLife).toEqual("2024-08-31T00:00:00Z");
    });
});
