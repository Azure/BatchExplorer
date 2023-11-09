import { BasicFakeSet, FakeSet } from "../test-util/fakes";
import { Subscription } from "./subscription-models";
import { SubscriptionService } from "./subscription-service";

export class FakeSubscriptionService implements SubscriptionService {
    fakeSet: FakeSet = new BasicFakeSet();

    setFakes(fakeSet: FakeSet): void {
        this.fakeSet = fakeSet;
    }

    async list(): Promise<Subscription[]> {
        return this.fakeSet.listSubscriptionsByDefaultTenant();
    }

    async get(subscriptionId: string): Promise<Subscription | undefined> {
        return this.fakeSet.getSubscription(subscriptionId);
    }
}
