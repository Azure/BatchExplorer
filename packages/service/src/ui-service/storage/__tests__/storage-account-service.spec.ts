import {
    getMockEnvironment,
    initMockEnvironment,
    MockHttpClient,
    MockHttpResponse,
} from "@batch/ui-common";
import { FakeStorageAccountService } from "../fake-storage-account-service";

describe("StorageAccountService", () => {
    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockEnvironment();
        httpClient = getMockEnvironment().getHttpClient();
    });

    test("list()", async () => {
        const service = new FakeStorageAccountService();

        httpClient.addExpected(
            new MockHttpResponse(
                "/subscriptions/sub1/storageAccounts",
                200,
                `[1, 2, 3]`
            )
        );
        const accounts = await service.list("/fake/sub1");

        expect(accounts.length).toEqual(3);
    });
});
