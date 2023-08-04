import {
    ArmResourceListResponse,
    normalizeSubscriptionId,
    normalizeSubscriptionResourceId,
} from "../arm";
import { ApiVersion, Endpoints } from "../constants";
import { UnexpectedStatusCodeError } from "../errors";
import { AbstractHttpService } from "../http-service";
import { Subscription } from "./subscription-models";
import { SubscriptionService } from "./subscription-service";

export class LiveSubscriptionService
    extends AbstractHttpService
    implements SubscriptionService
{
    async list(): Promise<Subscription[]> {
        const response = await this.httpClient.get(
            `${Endpoints.arm}/subscriptions?api-version=${ApiVersion.arm}`
        );
        const json =
            (await response.json()) as ArmResourceListResponse<Subscription>;
        return json.value;
    }

    async get(subscriptionId: string): Promise<Subscription | undefined> {
        const normalizedId = normalizeSubscriptionResourceId(subscriptionId);
        const response = await this.httpClient.get(
            `${Endpoints.arm}${normalizedId}?api-version=${ApiVersion.arm}`,
            {}
        );
        if (response.status === 404) {
            return undefined;
        }
        if (response.status === 200) {
            return (await response.json()) as Subscription;
        }
        throw new UnexpectedStatusCodeError(
            `Failed to get subscription ${normalizeSubscriptionId(
                subscriptionId
            )}`,
            response.status,
            await response.text()
        );
    }
}
