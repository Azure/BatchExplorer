import { initMockBatchEnvironment } from "../../environment";
import { BatchFakeSet, BasicBatchFakeSet } from "../../test-util/fakes";
import { FakeNodeService } from "../fake-node-service";

describe("FakeNodeService", () => {
    const poolId = `/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo/pools/hobopool1`;
    const nodeId = `tvmps_id1`;

    let service: FakeNodeService;
    let fakeSet: BatchFakeSet;

    beforeEach(() => {
        initMockBatchEnvironment();
        fakeSet = new BasicBatchFakeSet();
        service = new FakeNodeService();
        service.setFakes(fakeSet);
    });

    test("List batch nodes", async () => {
        const nodes = await service.listBatchNodes("", poolId);
        expect(nodes?.map((node) => node.id)).toEqual([nodeId]);
    });

    test("List batch node extensions", async () => {
        const extensions = await service.listBatchNodeExtensions(
            "",
            "",
            nodeId
        );
        expect(
            extensions?.map((extension) => extension?.vmExtension?.name)
        ).toEqual(["CustomExtension100"]);
    });
});
