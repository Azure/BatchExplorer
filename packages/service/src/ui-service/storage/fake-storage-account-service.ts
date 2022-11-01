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
    public async list(subscriptionId: string): Promise<StorageAccount[]> {
        if (subscriptionId in subscriptionAccounts) {
            return subscriptionAccounts[subscriptionId];
        } else if (subscriptionId === "/fake/badsub") {
            // Simulates a network error.
            throw new Error("No storage accounts in subscription.");
        } else {
            return [];
        }
    }

    public async get(): Promise<StorageAccount | null> {
        return null;
    }

    public async create(): Promise<void> {
        return;
    }
    public async remove(): Promise<void> {
        return;
    }
    public async update(): Promise<void> {
        return;
    }
}
