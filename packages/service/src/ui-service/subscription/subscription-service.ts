import { ApiVersion, Endpoints } from "../constants";
import { AbstractHttpService } from "../http-service";
import { ResourceService } from "../resource-service";
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
        const json = await response.json();
        return (json as any).value as Subscription[];
    }

    public async get(accountId: string): Promise<Subscription | null> {
        return null;
    }

    public async create(account: Subscription): Promise<void> {
        return;
    }
    public async remove(account: Subscription): Promise<void> {
        return;
    }
    public async update(account: Subscription): Promise<void> {
        return;
    }
}
