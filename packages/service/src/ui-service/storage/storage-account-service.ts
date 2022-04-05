import { ApiVersion, Endpoints } from "../constants";
import { AbstractHttpService } from "../http-service";
import { ResourceService } from "../resource-service";
import { StorageAccount } from "./storage-account-models";

export interface StorageAccountService extends ResourceService<StorageAccount> {
    list(subscriptionId: string): Promise<StorageAccount[]>;
    get(id: string): Promise<StorageAccount | null>;
    create(account: StorageAccount): Promise<void>;
    remove(account: StorageAccount): Promise<void>;
    update(account: StorageAccount): Promise<void>;
}

export class StorageAccountServiceImpl
    extends AbstractHttpService
    implements StorageAccountService
{
    public async list(subscriptionId: string): Promise<StorageAccount[]> {
        const response = await this.httpClient.get(
            `${Endpoints.arm}/subscriptions/${formatSubscriptionId(
                subscriptionId
            )}/providers/Microsoft.Storage/storageAccounts?api-version=${
                ApiVersion.arm
            }`,
            {}
        );
        const json = await response.json();
        console.log("JSON", json);
        return (json as any).value as StorageAccount[];
    }

    public async get(accountId: string): Promise<StorageAccount | null> {
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

function formatSubscriptionId(id: string) {
    return id?.replace(/^\/subscriptions\//, "");
}
