import { BatchAccount, StorageAccount } from "app/models";

export interface SharedKeyCredentials {
    batchAccount: {
        resource: BatchAccount;
        primary: string;
        secondary: string;
    };
    storageAccount?: {
        resource: StorageAccount;
        primary: string;
        secondary: string;
    };
}
