import { BasicFakeSet, FakeSet } from "../test-util/fakes";
import { StorageAccount } from "./storage-account-models";
import { StorageAccountService } from "./storage-account-service";

export class FakeStorageAccountService implements StorageAccountService {
    fakeSet: FakeSet = new BasicFakeSet();

    setFakes(fakeSet: FakeSet): void {
        this.fakeSet = fakeSet;
    }

    public async listBySubscriptionId(
        subscriptionId: string
    ): Promise<StorageAccount[]> {
        if (subscriptionId === "badsub") {
            // Simulates a network error.
            throw new Error("Fake network error");
        }
        return this.fakeSet.listStorageAccountsBySubscription(subscriptionId);
    }

    public async get(id: string): Promise<StorageAccount | undefined> {
        return this.fakeSet.getStorageAccount(id);
    }
}
