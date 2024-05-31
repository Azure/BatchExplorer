import { initMockBatchEnvironment } from "../../environment";
import { BatchFakeSet, BasicBatchFakeSet } from "../../test-util/fakes";
import { FakeNodeService } from "../fake-node-service";

describe("FakeNodeService", () => {
    const hoboAcctEndpoint = "mercury.eastus.batch.azure.com";

    let service: FakeNodeService;
    let fakeSet: BatchFakeSet;

    beforeEach(() => {
        initMockBatchEnvironment();
        fakeSet = new BasicBatchFakeSet();
        service = new FakeNodeService();
        service.setFakes(fakeSet);
    });

    test("List batch nodes", async () => {
        const nodes = await service.listNodes(hoboAcctEndpoint, "hobopool1");

        const allNodes = [];
        for await (const node of nodes) {
            allNodes.push(node);
        }

        expect(allNodes.map((node) => node.id)).toEqual(["tvmps_id1"]);
    });

    test("List batch node extensions", async () => {
        const extensions = await service.listVmExtensions(
            hoboAcctEndpoint,
            "hobopool1",
            "tvmps_id1"
        );
        expect(
            extensions.map((extension) => extension?.vmExtension?.name)
        ).toEqual(["CustomExtension100"]);
    });
});
