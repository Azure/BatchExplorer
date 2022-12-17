import {
    initMockEnvironment,
    getMockEnvironment,
} from "@batch/ui-common/lib/environment";
import { MockHttpClient, MockHttpResponse } from "@batch/ui-common/lib/http";
import { StorageAccountServiceImpl } from "..";
import { ApiVersion, Endpoints } from "../../constants";

describe("StorageAccountService", () => {
    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockEnvironment();
        httpClient = getMockEnvironment().getHttpClient();
    });

    afterEach(() => {
        const assertions = httpClient.remainingAssertions();
        if (assertions.length > 0) {
            throw new Error(
                `HTTP client has untested assertions (${assertions.join(", ")})`
            );
        }
    });

    test("list()", async () => {
        const service = new StorageAccountServiceImpl();

        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}/subscriptions//fake/sub1/providers/Microsoft.Storage/storageAccounts?api-version=${ApiVersion.storage.arm}`,
                {
                    status: 200,
                    body: JSON.stringify({
                        value: [
                            { id: "1", name: "One" },
                            { id: "2", name: "Two" },
                            { id: "3", name: "Three" },
                        ],
                    }),
                }
            )
        );
        const accounts = await service.list("/fake/sub1");

        expect(accounts.length).toEqual(3);
    });
});
