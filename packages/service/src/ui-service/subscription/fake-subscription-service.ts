import { Subscription } from "./subscription-models";
import { SubscriptionService } from "./subscription-service";

const subscriptions = [
    { id: "/fake/sub1", displayName: "Subscription One" },
    { id: "/fake/sub2", displayName: "Subscription Two" },
    { id: "/fake/sub3", displayName: "Subscription Three" },
    { id: "/fake/sub4", displayName: "Subscription Four" },
    { id: "/fake/badsub", displayName: "Bad Subscription" },
];

export class FakeSubscriptionService implements SubscriptionService {
    public list(): Promise<Subscription[]> {
        return Promise.resolve(subscriptions as Subscription[]);
    }

    public async get(id: string): Promise<Subscription | null> {
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
