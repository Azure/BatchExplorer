import { StorageAccount } from "./storage-account-models";

export interface StorageAccountService {
    listBySubscriptionId(subscriptionId: string): Promise<StorageAccount[]>;
    get(id: string): Promise<StorageAccount | undefined>;
}
