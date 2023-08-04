import { Subscription } from "./subscription-models";

export interface SubscriptionService {
    list(): Promise<Subscription[]>;
    get(subscriptionId: string): Promise<Subscription | undefined>;
}
