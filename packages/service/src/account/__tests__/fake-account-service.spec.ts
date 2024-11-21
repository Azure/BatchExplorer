import { initMockBatchEnvironment } from "../../environment";
import { BatchFakeSet, BasicBatchFakeSet } from "../../test-util/fakes";
import { FakeAccountService } from "../fake-account-service";

describe("FakeAccountService", () => {
    const hoboAcctResId =
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo";

    let service: FakeAccountService;
    let fakeSet: BatchFakeSet;
    beforeEach(() => {
        initMockBatchEnvironment();
        fakeSet = new BasicBatchFakeSet();
        service = new FakeAccountService();
        service.setFakes(fakeSet);
    });

    test("Get account by ARM resource ID", async () => {
        const account = await service.get(hoboAcctResId);
        expect(account?.name).toEqual("hobo");
    });

    test("should return undefined ARM resource ID not found", async () => {
        const account = await service.get(
            "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/not-hobo"
        );
        expect(account).toBeUndefined();
    });
});
