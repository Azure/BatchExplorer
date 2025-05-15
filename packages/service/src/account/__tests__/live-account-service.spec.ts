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

    test("Return undefined if account not found", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}${hoboAcctResId}?api-version=${BatchApiVersion.arm}`,
                {
                    status: 404,
                    body: "Not found",
                }
            )
        );

        const account = await service.get(hoboAcctResId);
        expect(account).toBeUndefined();
    });

    test("Patch account successfully", async () => {
        const oriAccount = fakeSet.getBatchAccount(hoboAcctResId);
        const patchBody = { tags: { key123: "value123" } };
        const mockResponse = {
            ...oriAccount,
            ...patchBody,
        };

        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}${hoboAcctResId}?api-version=${BatchApiVersion.arm}`,
                {
                    status: 200,
                    body: JSON.stringify(mockResponse),
                }
            ),
            {
                method: "PATCH",
                body: JSON.stringify(patchBody),
            }
        );

        const result = await service.patch(hoboAcctResId, patchBody);
        expect(result).toBeDefined();
        expect(result?.tags).toEqual({ key123: "value123" });
    });

    test("Patch account returns undefined if not found", async () => {
        const patchBody = { tags: { key: "value" } };

        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}${hoboAcctResId}?api-version=${BatchApiVersion.arm}`,
                {
                    status: 404,
                    body: "Not found",
                }
            ),
            {
                method: "PATCH",
                body: JSON.stringify(patchBody),
            }
        );

        const result = await service.patch(hoboAcctResId, patchBody);
        expect(result).toBeUndefined();
    });

    test("Patch account throws error on unexpected status", async () => {
        const patchBody = { tags: { key: "value" } };

        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}${hoboAcctResId}?api-version=${BatchApiVersion.arm}`,
                {
                    status: 500,
                    body: "Internal Server Error",
                }
            ),
            {
                method: "PATCH",
                body: JSON.stringify(patchBody),
            }
        );

        await expect(() => service.patch(hoboAcctResId, patchBody)).rejects
            .toMatchInlineSnapshot(`
            [Error: The Batch management plane returned an unexpected status code [unexpected 500 status]
            Response body:
            "Internal Server Error"]
            `);
    });

    test("List network security perimeter configurations", async () => {
        const mockConfig =
            fakeSet.listNetworkSecurityPerimeterConfigurations(hoboAcctResId);

        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}${hoboAcctResId}/networkSecurityPerimeterConfigurations?api-version=${BatchApiVersion.arm}`,
                {
                    status: 200,
                    body: JSON.stringify(mockConfig),
                }
            )
        );

        const config =
            await service.listNetworkSecurityPerimeterConfigurations(
                hoboAcctResId
            );
        expect(config?.value?.length).toEqual(1);

        expect(config?.value?.[0].name).toEqual(
            "00000000-0000-0000-0000-000000000000.resourceAssociationName"
        );
    });
});
