import { getArmUrl } from "@azure/bonito-core";
import { getMockEnvironment } from "@azure/bonito-core/lib/environment";
import { MockHttpClient, MockHttpResponse } from "@azure/bonito-core/lib/http";
import { BatchApiVersion } from "../../constants";
import { initMockBatchEnvironment } from "../../environment";
import { BatchFakeSet, BasicBatchFakeSet } from "../../test-util/fakes";
import { LiveAccountService } from "../live-account-service";

describe("LiveAccountService", () => {
    const hoboAcctResId =
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo";

    let service: LiveAccountService;
    let fakeSet: BatchFakeSet;
    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockBatchEnvironment();
        httpClient = getMockEnvironment().getHttpClient();
        service = new LiveAccountService();
        fakeSet = new BasicBatchFakeSet();
    });

    test("Get account by ARM resource ID", async () => {
        const mockAccountRes = fakeSet.getBatchAccount(hoboAcctResId);
        // change the name of the account to test bypassing the cache
        const mockAccountResRenamed = {
            ...mockAccountRes,
            name: "hobo2",
        };

        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}${hoboAcctResId}?api-version=${BatchApiVersion.arm}`,
                {
                    status: 200,
                    body: JSON.stringify(mockAccountRes),
                }
            )
        );

        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}${hoboAcctResId}?api-version=${BatchApiVersion.arm}`,
                {
                    status: 200,
                    body: JSON.stringify(mockAccountResRenamed),
                }
            )
        );

        const account = await service.get(hoboAcctResId);
        expect(account?.name).toEqual("hobo");

        // verify that the cache is working
        const account2 = await service.get(hoboAcctResId);
        expect(account2?.name).toEqual("hobo");

        // verify that the cache is bypassed
        const account3 = await service.get(hoboAcctResId, {
            bypassCache: true,
        });
        expect(account3?.name).toEqual("hobo2");
    });

    test("Get account by ARM resource ID error", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}${hoboAcctResId}?api-version=${BatchApiVersion.arm}`,
                {
                    status: 500,
                    body: "Boom",
                }
            )
        );

        await expect(() => service.get(hoboAcctResId)).rejects
            .toMatchInlineSnapshot(`
                [Error: The Batch management plane returned an unexpected status code [unexpected 500 status]
                Response body:
                "Boom"]
                `);
    });
});
