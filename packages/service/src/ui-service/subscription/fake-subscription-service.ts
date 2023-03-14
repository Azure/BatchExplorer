import { BasicFakeSet, FakeSet } from "../test-util/fakes";
import { Subscription } from "./subscription-models";
import { SubscriptionService } from "./subscription-service";

export class FakeSubscriptionService implements SubscriptionService {
    fakeSet: FakeSet = new BasicFakeSet();

    public setFakes(fakeSet: FakeSet): void {
        this.fakeSet = fakeSet;
    }

    public async list(): Promise<Subscription[]> {
        return Object.values(this.fakeSet.subscriptions);
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
