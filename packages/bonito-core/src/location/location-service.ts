import { Location } from "./location-models";

export interface LocationService {
    listBySubscriptionId(subscriptionId: string): Promise<Location[]>;
    get(id: string): Promise<Location | undefined>;
}
