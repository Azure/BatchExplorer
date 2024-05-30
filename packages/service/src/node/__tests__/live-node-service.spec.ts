import { getMockEnvironment } from "@azure/bonito-core/lib/environment";
import { MockHttpClient, MockHttpResponse } from "@azure/bonito-core/lib/http";
import { BatchApiVersion } from "../../constants";
import { initMockBatchEnvironment } from "../../environment";
import { BasicBatchFakeSet, BatchFakeSet } from "../../test-util/fakes";
import { LiveNodeService } from "../live-node-service";
import { NodeService } from "../node-service";

describe("LiveNodeService", () => {
    const hoboAcctEndpoint = "mercury.eastus.batch.azure.com";

    let service: NodeService;
    let fakeSet: BatchFakeSet;

    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockBatchEnvironment();
        httpClient = getMockEnvironment().getHttpClient();
        service = new LiveNodeService();
        fakeSet = new BasicBatchFakeSet();
    });

    test("Simple get", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `https://${hoboAcctEndpoint}/pools/hobopool1/nodes/tvmps_id1?api-version=${BatchApiVersion.data}`,
                {
                    status: 200,
                    body: JSON.stringify(
                        fakeSet.getNode(
                            hoboAcctEndpoint,
                            "hobopool1",
                            "tvmps_id1"
                        )
                    ),
                }
            )
        );

        const node = await service.getNode(
            hoboAcctEndpoint,
            "hobopool1",
            "tvmps_id1"
        );
        expect(node).toBeDefined();
        expect(node.id).toEqual("tvmps_id1");
    });

    test("List by pool", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `https://${hoboAcctEndpoint}/pools/hobopool1/nodes?api-version=${BatchApiVersion.data}`,
                {
                    status: 200,
                    body: JSON.stringify({
                        value: fakeSet.listNodes(hoboAcctEndpoint, "hobopool1"),
                    }),
                }
            )
        );

        const nodes = await service.listNodes(hoboAcctEndpoint, "hobopool1");
        const allNodes = [];
        for await (const node of nodes) {
            allNodes.push(node);
        }
        expect(allNodes.length).toBe(1);
        expect(allNodes.map((node) => node.id)).toEqual(["tvmps_id1"]);
    });

    test("List VM extensions", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `https://${hoboAcctEndpoint}/pools/hobopool1/nodes/tvmps_id1/extensions?api-version=${BatchApiVersion.data}`,
                {
                    status: 200,
                    body: JSON.stringify({
                        value: fakeSet.listVmExtensions("tvmps_id1"),
                    }),
                }
            )
        );

        const extensions = await service.listVmExtensions(
            hoboAcctEndpoint,
            "hobopool1",
            "tvmps_id1"
        );
        expect(extensions.length).toBe(1);
        expect(extensions.map((ext) => ext.vmExtension?.name)).toEqual([
            "CustomExtension100",
        ]);
    });
});
