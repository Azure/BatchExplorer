import { AccountResource, StorageAccount } from "app/models";

export interface SharedKeyCredentials {
    batchAccount: {
        resource: AccountResource;
        primary: string;
        secondary: string;
    };
    storageAccount?: {
        resource: StorageAccount;
        primary: string;
        secondary: string;
    };
}
