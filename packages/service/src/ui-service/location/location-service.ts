import { ApiVersion, Endpoints } from "../constants";
import { AbstractHttpService } from "../http-service";
import { Location } from "./location-model";

export interface LocationService {
    list(subscriptionId: string): Promise<Location[]>;
    get(id: string): Promise<Location | null>;
    create(account: Location): Promise<void>;
    remove(account: Location): Promise<void>;
    update(account: Location): Promise<void>;
}

export class LocationServiceImpl
    extends AbstractHttpService
    implements LocationService
{
    public async list(subscriptionId: string): Promise<Location[]> {
        const response = await this.httpClient.get(
            `${Endpoints.arm}/subscriptions/${subscriptionId}/locations?api-version=${ApiVersion.arm}`
        );
        //URL: https://management.azure.com/subscriptions/{subscriptionId}/locations?api-version=2020-01-01
        const json = await response.json();
        return (json as any).value as Location[];
    }

    public async get(accountId: string): Promise<Location | null> {
        return null;
    }

    public async create(account: Location): Promise<void> {
        return;
    }
    public async remove(account: Location): Promise<void> {
        return;
    }
    public async update(account: Location): Promise<void> {
        return;
    }
}
