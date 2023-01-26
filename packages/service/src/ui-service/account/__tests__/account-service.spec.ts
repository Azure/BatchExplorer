import { BatchAccountOutput } from "@batch/arm-batch-rest/lib/generated";
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

    // test("Get cert 404 not found", async () => {
    //     const service = new CertificateService();

    //     httpClient.addExpected(
    //         new MockHttpResponse(
    //             "https://prodtest1.brazilsouth.batch.azure.com/certificates(thumbprintAlgorithm=sha1,thumbprint=does-not-exist)?api-version=2020-09-01.12.0",
    //             {
    //                 status: 404,
    //             }
    //         )
    //     );

    //     const cert = await service.get("does-not-exist");
    //     expect(cert.response.status).toBe(404);
    //     expect(cert.model).toBeUndefined();
    // });
});
