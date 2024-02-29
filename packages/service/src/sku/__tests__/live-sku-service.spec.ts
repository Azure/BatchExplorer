import { MockHttpClient, MockHttpResponse } from "@azure/bonito-core/lib/http";
import {
    BasicBatchFakeSet,
    BatchFakeSet,
    FakeLocations,
} from "../../test-util/fakes";
import { LiveSkuService } from "../live-sku-service";
import { initMockBatchEnvironment } from "../../environment";
import { getMockEnvironment } from "@azure/bonito-core/lib/environment";
import { getArmUrl } from "@azure/bonito-core";
import { BatchApiVersion } from "../../constants";
import { SupportedSkuType } from "../sku-models";

describe("LiveSkuService", () => {
    const arrakisLoc =
        "/subscriptions/00000000-0000-0000-0000-000000000000/providers/Microsoft.Batch/locations/arrakis";
    let service: LiveSkuService;
    let fakeSet: BatchFakeSet;

    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockBatchEnvironment();
        httpClient = getMockEnvironment().getHttpClient();
        service = new LiveSkuService();
        fakeSet = new BasicBatchFakeSet();
    });

    test("List virtual machine SKUs", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}${arrakisLoc}/virtualMachineSkus?api-version=${
                    BatchApiVersion.arm
                }`,
                {
                    status: 200,
                    body: JSON.stringify({
                        value: fakeSet.listSupportedSkus(
                            SupportedSkuType.VirtualMachine,
                            FakeLocations.Arrakis.name
                        ),
                    }),
                }
            )
        );

        const skus = await service.list({
            subscriptionId: "00000000-0000-0000-0000-000000000000",
            locationName: FakeLocations.Arrakis.name,
        });
        expect(skus.length).toEqual(4);
        expect(skus[2]).toEqual({
            name: "Standard_NC8as_T4_v3",
            familyName: "Standard NCASv3_T4 Family",
            batchSupportEndOfLife: "2024-08-31T00:00:00Z",
        });
    });
});
