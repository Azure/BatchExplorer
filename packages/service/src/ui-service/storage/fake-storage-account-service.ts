import { StorageAccount } from "./storage-account-models";
import { StorageAccountService } from "./storage-account-service";

// TODO: Move this into a FakeSet
const subscriptionAccounts: { [key: string]: StorageAccount[] } = {
    "/subscriptions/00000000-0000-0000-0000-000000000000": [
        { id: "/fake/storageA", name: "Storage A" },
        { id: "/fake/storageB", name: "Storage B" },
        { id: "/fake/storageC", name: "Storage C" },
    ],
    "/subscriptions/11111111-1111-1111-1111-111111111111": [
        { id: "/fake/storageD", name: "Storage D" },
        { id: "/fake/storageE", name: "Storage E" },
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
