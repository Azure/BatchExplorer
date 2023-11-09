import { initMockEnvironment, getMockEnvironment } from "../../environment";
import { MockHttpClient, MockHttpResponse } from "../../http";
import { ApiVersion } from "../../constants";
import { StorageAccountService } from "../storage-account-service";
import { LiveStorageAccountService } from "../live-storage-account-service";
import { getArmUrl } from "../../arm";

describe("StorageAccountService", () => {
    let service: StorageAccountService;
    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockEnvironment();
        httpClient = getMockEnvironment().getHttpClient();
        service = new LiveStorageAccountService();
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
        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}/subscriptions/sub1/providers/Microsoft.Storage/storageAccounts?api-version=${
                    ApiVersion.storage.arm
                }`,
                {
                    status: 200,
                    body: JSON.stringify({
                        value: [
                            {
                                id: "/subscriptions/sub1/providers/Microsoft.Storage/storageAccounts/one",
                                name: "one",
                            },
                            {
                                id: "/subscriptions/sub1/providers/Microsoft.Storage/storageAccounts/two",
                                name: "two",
                            },
                            {
                                id: "/subscriptions/sub1/providers/Microsoft.Storage/storageAccounts/three",
                                name: "three",
                            },
                        ],
                    }),
                }
            )
        );
        const accounts = await service.listBySubscriptionId("sub1");

        expect(accounts.length).toEqual(3);
    });

    test("get()", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}/subscriptions/sub1/providers/Microsoft.Storage/storageAccounts/two?api-version=${
                    ApiVersion.storage.arm
                }`,
                {
                    status: 200,
                    body: JSON.stringify({
                        id: "/subscriptions/sub1/providers/Microsoft.Storage/storageAccounts/two",
                        name: "two",
                    }),
                }
            )
        );
        expect(
            await service.get(
                "/subscriptions/sub1/providers/Microsoft.Storage/storageAccounts/two"
            )
        ).toEqual({
            id: "/subscriptions/sub1/providers/Microsoft.Storage/storageAccounts/two",
            name: "two",
        });
    });
});
