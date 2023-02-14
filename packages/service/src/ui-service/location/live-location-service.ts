import { ApiVersion, Endpoints } from "../constants";
import { AbstractHttpService } from "../http-service";
import { ArmResourceListResponse, normalizeSubscriptionId } from "../arm";
import type { LocationService } from "./location-service";
import { Location } from "./location-models";
import { UnexpectedStatusCodeError } from "../errors";

export class LiveLocationService
    extends AbstractHttpService
    implements LocationService
{
    /**
     * List locations by subscription
     *
     * @param subscriptionId Either the short or long-form (ARM) subscription ID
     * @returns A list of locations
     * @throws UnexpectedStatusCodeError if an unexpected HTTP status code is encountered
     */
    public async listBySubscriptionId(
        subscriptionId: string
    ): Promise<Location[]> {
        subscriptionId = normalizeSubscriptionId(subscriptionId);

        const response = await this.httpClient.get(
            `${Endpoints.arm}/subscriptions/${subscriptionId}/locations?api-version=${ApiVersion.arm}`,
            {}
        );
        if (response.status === 200) {
            const json =
                (await response.json()) as ArmResourceListResponse<Location>;
            return json.value;
        }
        throw new UnexpectedStatusCodeError(
            `Failed to list locations under subscription ${subscriptionId}`,
            response.status,
            await response.text()
        );
    }

    /**
     * Get a single location by its ARM resource ID
     *
     * @param resourceGroupId The ARM resource ID of the location
     * @returns A location, or undefined in the case of a 404
     * @throws UnexpectedStatusCodeError if an unexpected HTTP status code is encountered
     */
    public async get(locationId: string): Promise<Location | undefined> {
        const response = await this.httpClient.get(
            `${Endpoints.arm}${locationId}?api-version=${ApiVersion.arm}`,
            {}
        );
        if (response.status === 404) {
            return undefined;
        }
        if (response.status === 200) {
            return (await response.json()) as Location;
        }
        throw new UnexpectedStatusCodeError(
            `Failed to get location ${locationId}`,
            response.status,
            await response.text()
        );
    }
}
