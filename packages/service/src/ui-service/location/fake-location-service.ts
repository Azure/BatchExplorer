import { BasicFakeSet, FakeSet } from "../test-util/fakes";
import { Location } from "./location-models";
import { LocationService } from "./location-service";

export class FakeLocationService implements LocationService {
    fakeSet: FakeSet = new BasicFakeSet();

    setFakes(fakeSet: FakeSet): void {
        this.fakeSet = fakeSet;
    }

    public async listBySubscriptionId(
        subscriptionId: string
    ): Promise<Location[]> {
        return this.fakeSet.listLocationsBySubscription(subscriptionId);
    }

    public async get(locationId: string): Promise<Location | undefined> {
        return this.fakeSet.locations[locationId] ?? undefined;
    }
}
