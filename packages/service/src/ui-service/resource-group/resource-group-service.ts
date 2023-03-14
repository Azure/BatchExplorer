import { ResourceGroup } from "./resource-group-models";

export interface ResourceGroupService {
    listBySubscriptionId(subscriptionId: string): Promise<ResourceGroup[]>;
    get(id: string): Promise<ResourceGroup | undefined>;
}
