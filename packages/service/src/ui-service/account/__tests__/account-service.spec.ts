import {
    BatchAccountOutput,
    CloudErrorBodyOutput,
} from "@batch/arm-batch-rest/lib/generated";
import {
    DependencyName,
    getMockEnvironment,
    initMockEnvironment,
} from "@batch/ui-common/lib/environment";
import { MockHttpClient, MockHttpResponse } from "@batch/ui-common/lib/http";
import { AccountService } from "../account-service";

describe("Account service", () => {
    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockEnvironment();
        httpClient = getMockEnvironment().getInjectable(
            DependencyName.HttpClient
        );
    });

    test("Get account", async () => {
        const service = new AccountService();

        httpClient.addExpected(
            new MockHttpResponse(
                "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testrg/providers/Microsoft.Batch/batchAccounts/testacct?api-version=2022-10-01",
                {
                    status: 200,
                    body: JSON.stringify(<BatchAccountOutput>{
                        name: "testacct",
                        properties: {
                            dedicatedCoreQuota: 100,
                            lowPriorityCoreQuota: 0,
                        },
                    }),
                }
            )
        );

        const account = await service.get(
            "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testrg/providers/Microsoft.Batch/batchAccounts/testacct"
        );
        expect(account.name).toBe("testacct");
        expect(account.properties?.dedicatedCoreQuota).toBe(100);
        expect(account.properties?.lowPriorityCoreQuota).toBe(0);
    });

    test("List Batch accounts within a subscription", async () => {
        const service = new AccountService();

        httpClient.addExpected(
            new MockHttpResponse(
                "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/providers/Microsoft.Batch/batchAccounts?api-version=2022-10-01",
                {
                    status: 200,
                    body: JSON.stringify({
                        value: [
                            <BatchAccountOutput>{
                                name: "testacct",
                                properties: {
                                    dedicatedCoreQuota: 100,
                                    lowPriorityCoreQuota: 0,
                                },
                            },
                            <BatchAccountOutput>{
                                name: "testacct2",
                                properties: {
                                    dedicatedCoreQuota: 0,
                                    lowPriorityCoreQuota: 100,
                                },
                            },
                        ],
                    }),
                }
            )
        );

        const listResponse = await service.listBySubscription(
            "00000000-0000-0000-0000-000000000000"
        );
        expect(listResponse.length).toBe(2);
        expect(listResponse[0].name).toBe("testacct");
        expect(listResponse[0].properties?.dedicatedCoreQuota).toBe(100);
        expect(listResponse[0].properties?.lowPriorityCoreQuota).toBe(0);

        expect(listResponse[1].name).toBe("testacct2");
        expect(listResponse[1].properties?.dedicatedCoreQuota).toBe(0);
        expect(listResponse[1].properties?.lowPriorityCoreQuota).toBe(100);
    });

    test("Get Account 404 not found", async () => {
        const service = new AccountService();

        httpClient.addExpected(
            new MockHttpResponse(
                "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testrg/providers/Microsoft.Batch/batchAccounts/does-not-exist?api-version=2022-10-01",
                {
                    status: 404,
                    body: JSON.stringify({
                        error: <CloudErrorBodyOutput>{
                            code: "AccountDoesNotExist",
                            message: "The account does not exist",
                        },
                    }),
                }
            )
        );

        try {
            await service.get(
                "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testrg/providers/Microsoft.Batch/batchAccounts/does-not-exist"
            );
            fail("Exception was not thrown here");
        } catch (e) {
            if (!(e instanceof Error)) {
                fail("Expected exception to be an Error");
            }
            expect(e.message).toContain("404");
        }
    });
});
