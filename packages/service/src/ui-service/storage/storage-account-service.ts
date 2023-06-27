import { ApiVersion, Endpoints } from "../constants";
import { AbstractHttpService } from "../http-service";
import { ArmResourceListResponse } from "../arm";
import { StorageAccount } from "./storage-account-models";

export interface StorageAccountService {
    listBySubscriptionId(subscriptionId: string): Promise<StorageAccount[]>;
    get(id: string): Promise<StorageAccount | null>;
    create(account: StorageAccount): Promise<void>;
    remove(account: StorageAccount): Promise<void>;
    update(account: StorageAccount): Promise<void>;
}

export class StorageAccountServiceImpl
    extends AbstractHttpService
    implements StorageAccountService
{
    public async listBySubscriptionId(
        subscriptionId: string
    ): Promise<StorageAccount[]> {
        const response = await this.httpClient.get(
            `${Endpoints.arm}/subscriptions/${subscriptionId}/providers/Microsoft.Storage/storageAccounts?api-version=${ApiVersion.storage.arm}`,
            {}
        );
        const json =
            (await response.json()) as ArmResourceListResponse<StorageAccount>;
        return json.value;
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
