import { ApiVersion, Endpoints } from "../constants";
import { AbstractHttpService } from "../http-service";
import { ResourceListResponse, ResourceService } from "../resource-service";
import { Subscription } from "./subscription-models";

export interface SubscriptionService extends ResourceService<Subscription> {
    list(): Promise<Subscription[]>;
    get(id: string): Promise<Subscription | null>;
    create(account: Subscription): Promise<void>;
    remove(account: Subscription): Promise<void>;
    update(account: Subscription): Promise<void>;
}

export class SubscriptionServiceImpl
    extends AbstractHttpService
    implements SubscriptionService
{
    public async list(): Promise<Subscription[]> {
        const response = await this.httpClient.get(
            `${Endpoints.arm}/subscriptions?api-version=${ApiVersion.arm}`
        );
        const json =
            (await response.json()) as ResourceListResponse<Subscription>;
        return json.value;
    }

    public async get(): Promise<Subscription | null> {
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
