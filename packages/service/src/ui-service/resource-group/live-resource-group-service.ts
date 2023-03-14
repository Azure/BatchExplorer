import { ApiVersion, Endpoints } from "../constants";
import { AbstractHttpService } from "../http-service";
import { ArmResourceListResponse, normalizeSubscriptionId } from "../arm";
import type { ResourceGroupService } from "./resource-group-service";
import { ResourceGroup } from "./resource-group-models";
import { UnexpectedStatusCodeError } from "../errors";

export class LiveResourceGroupService
    extends AbstractHttpService
    implements ResourceGroupService
{
    /**
     * List resource groups by subscription
     *
     * @param subscriptionId Either the short or long-form (ARM) subscription ID
     * @returns A list of resource groups
     * @throws UnexpectedStatusCodeError if an unexpected HTTP status code is encountered
     */
    public async listBySubscriptionId(
        subscriptionId: string
    ): Promise<ResourceGroup[]> {
        subscriptionId = normalizeSubscriptionId(subscriptionId);

        const response = await this.httpClient.get(
            `${Endpoints.arm}/subscriptions/${subscriptionId}/resourcegroups?api-version=${ApiVersion.arm}`,
            {}
        );
        if (response.status === 200) {
            const json =
                (await response.json()) as ArmResourceListResponse<ResourceGroup>;
            return json.value;
        }
        throw new UnexpectedStatusCodeError(
            `Failed to list resource groups under subscription ${subscriptionId}`,
            response.status,
            await response.text()
        );
    }

    /**
     * Get a single resource group by its ARM resource ID
     *
     * @param resourceGroupId The ARM resource ID of the resource group
     * @returns A resource group, or undefined in the case of a 404
     * @throws UnexpectedStatusCodeError if an unexpected HTTP status code is encountered
     */
    public async get(
        resourceGroupId: string
    ): Promise<ResourceGroup | undefined> {
        const response = await this.httpClient.get(
            `${Endpoints.arm}${resourceGroupId}?api-version=${ApiVersion.arm}`,
            {}
        );
        if (response.status === 404) {
            return undefined;
        }
        if (response.status === 200) {
            return (await response.json()) as ResourceGroup;
        }
        throw new UnexpectedStatusCodeError(
            `Failed to get resource group ${resourceGroupId}`,
            response.status,
            await response.text()
        );
    }
}
