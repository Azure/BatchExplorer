export interface StorageAccount {
    id: string;
    name: string;
    type: "Microsoft.Storage/storageAccounts";
    location: string;
    kind: string;
    sku: StorageSku;
    properties: {
        provisioningState: string;
    };
}

export interface StorageSku {
    name: string;
    tier?: string;
}
