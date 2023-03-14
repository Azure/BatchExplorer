import { BasicFakeSet, FakeSet } from "../test-util/fakes";
import { ResourceGroup } from "./resource-group-models";
import type { ResourceGroupService } from "./resource-group-service";

export class FakeResourceGroupService implements ResourceGroupService {
    fakeSet: FakeSet = new BasicFakeSet();

    setFakes(fakeSet: FakeSet): void {
        this.fakeSet = fakeSet;
    }

    public async listBySubscriptionId(
        subscriptionId: string
    ): Promise<ResourceGroup[]> {
        return this.fakeSet.listResourceGroupsBySubscription(subscriptionId);
    }

    public async get(
        resourceGroupId: string
    ): Promise<ResourceGroup | undefined> {
        return this.fakeSet.resourceGroups[resourceGroupId] ?? undefined;
    }
}
