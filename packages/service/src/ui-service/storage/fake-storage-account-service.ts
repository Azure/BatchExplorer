import { StorageAccount } from "./storage-account-models";
import { StorageAccountService } from "./storage-account-service";

const subscriptionAccounts: { [key: string]: StorageAccount[] } = {
    "/fake/sub1": [
        { id: "/fake/storageA", name: "Storage A" },
        { id: "/fake/storageB", name: "Storage B" },
        { id: "/fake/storageC", name: "Storage C" },
    ],
    "/fake/sub2": [
        { id: "/fake/storageD", name: "Storage D" },
        { id: "/fake/storageE", name: "Storage E" },
    ],
    "/fake/sub3": [
        { id: "/fake/storageF", name: "Storage F" },
        { id: "/fake/storageG", name: "Storage G" },
        { id: "/fake/storageH", name: "Storage H" },
        { id: "/fake/storageI", name: "Storage I" },
    ],
};

export class FakeStorageAccountService implements StorageAccountService {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    public list(subscriptionId: string): Promise<StorageAccount[]> {
        return Promise.resolve(
            subscriptionId in subscriptionAccounts
                ? subscriptionAccounts[subscriptionId]
                : []
        );
    }

    public async get(id: string): Promise<StorageAccount | null> {
        return null;
    }

    public async create(account: StorageAccount): Promise<void> {
        return;
    }
    public async remove(account: StorageAccount): Promise<void> {
        return;
    }
    public async update(account: StorageAccount): Promise<void> {
        return;
    }
}
