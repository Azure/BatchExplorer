import {
    ArmResourceListResponse,
    normalizeSubscriptionResourceId,
} from "../arm";
import { ApiVersion, Endpoints } from "../constants";
import { UnexpectedStatusCodeError } from "../errors";
import { AbstractHttpService } from "../http-service";
import { StorageAccount } from "./storage-account-models";
import { StorageAccountService } from "./storage-account-service";

export class LiveStorageAccountService
    extends AbstractHttpService
    implements StorageAccountService
{
    async listBySubscriptionId(
        subscriptionId: string
    ): Promise<StorageAccount[]> {
        const normalizedSubId = normalizeSubscriptionResourceId(subscriptionId);
        const response = await this.httpClient.get(
            `${Endpoints.arm}${normalizedSubId}/providers/Microsoft.Storage/storageAccounts?api-version=${ApiVersion.storage.arm}`,
            {}
        );
        const json =
            (await response.json()) as ArmResourceListResponse<StorageAccount>;
        return json.value;
    }

    async get(id: string): Promise<StorageAccount | undefined> {
        const response = await this.httpClient.get(
            `${Endpoints.arm}${id}?api-version=${ApiVersion.storage.arm}`,
            {}
        );
        if (response.status === 404) {
            return undefined;
        }
        if (response.status === 200) {
            return (await response.json()) as StorageAccount;
        }
        throw new UnexpectedStatusCodeError(
            `Failed to get storage account ${id}`,
            response.status,
            await response.text()
        );
    }
}
