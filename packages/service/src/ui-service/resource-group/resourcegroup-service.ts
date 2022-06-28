import { ApiVersion, Endpoints } from "../constants";
import { AbstractHttpService } from "../http-service";
import { ResourceService } from "../resource-service";
import { ResourceGroup } from "./resourcegroup-model";

export interface ResourceGroupService extends ResourceService<ResourceGroup> {
    list(subscriptionId: string): Promise<ResourceGroup[]>;
    get(id: string): Promise<ResourceGroup | null>;
    create(account: ResourceGroup): Promise<void>;
    remove(account: ResourceGroup): Promise<void>;
    update(account: ResourceGroup): Promise<void>;
}

export class ResourceGroupServiceImpl
    extends AbstractHttpService
    implements ResourceGroupService
{
    public async list(subscriptionId: string): Promise<ResourceGroup[]> {
        const response = await this.httpClient.get(
            `${Endpoints.arm}/subscriptions/${subscriptionId}/resourcegroups?api-version=${ApiVersion.arm}`
        );
        //https://management.azure.com/subscriptions/{subscriptionId}/resourcegroups?api-version=2021-04-01
        const json = await response.json();
        return (json as any).value as ResourceGroup[];
    }

    public async get(accountId: string): Promise<ResourceGroup | null> {
        return null;
    }

    public async create(account: ResourceGroup): Promise<void> {
        return;
    }
    public async remove(account: ResourceGroup): Promise<void> {
        return;
    }
    public async update(account: ResourceGroup): Promise<void> {
        return;
    }
}
