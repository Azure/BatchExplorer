import { initMockEnvironment } from "@batch/ui-common/lib/environment";
import { BasicFakeSet, FakeSet } from "../../test-util/fakes";
import { FakeStorageAccountService } from "../fake-storage-account-service";

describe("FakeStorageAccountService", () => {
    const tanukiSubId = "00000000-0000-0000-0000-000000000000";

    let service: FakeStorageAccountService;
    let fakeSet: FakeSet;

    beforeEach(() => {
        initMockEnvironment();
        fakeSet = new BasicFakeSet();
        service = new FakeStorageAccountService();
        service.setFakes(fakeSet);
    });

    test("List storage accounts by subscription", async () => {
        const storageAccounts = await service.listBySubscriptionId(tanukiSubId);
        expect(storageAccounts.map((account) => account.name)).toEqual([
            "storageB",
            "storageA",
            "storageC",
        ]);
    });

    test("Get by ID", async () => {
        const storageCId =
            "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/visualization/providers/Microsoft.Storage/storageaccounts/storageC";
        const account = await service.get(storageCId);
        expect(account?.name).toEqual("storageC");
    });
});
