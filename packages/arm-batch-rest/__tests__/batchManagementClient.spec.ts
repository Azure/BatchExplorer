import { BatchManagementClient } from "../src/generated";
import { generateClient, MockHttpClient } from "./utils/client";

describe("Batch Test", () => {
    let batchClient: BatchManagementClient;
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID!;
    const resourceGroupName = process.env.MABOM_BatchAccountResourceGroupName!;

    // beforeEach(() => {

    // });

    test("Get pool", async () => {
        const mockClient: MockHttpClient = new MockHttpClient(
            200,
            `{
                "name": "linuxperfpool",
                "state": "active",
                "allocationState": "steady",
                "vmSize": "standard_d1_v2",
                "resizeTimeout": "PT15M",
                "currentDedicatedNodes": 4,
                "targetDedicatedNodes": 4,
                "currentLowPriorityNodes": 0,
                "provisioningState": "Succeeded"
            }`
        );

        batchClient = generateClient({ httpClient: mockClient });
        const getResult = await batchClient
            .path(
                "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}",
                subscriptionId,
                resourceGroupName,
                "fakesdktest",
                "linuxperfpool"
            )
            .get();

        if (getResult.status !== "200") {
            throw new Error("foobar");
            fail("Non-200 response from get pool");
        }
        //expect(getResult.body.name).toBe("linuxperfpool");


    });

    test("Get pool 404 not found", async () => {
        console.log(batchClient);
    });
});
