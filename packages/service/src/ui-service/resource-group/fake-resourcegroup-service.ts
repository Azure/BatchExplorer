import { ResourceGroup } from "./resourcegroup-model";
import { ResourceGroupService } from "./resourcegroup-service";

const resourceGroups: { [key: string]: ResourceGroup[] } = {
    "/fake/sub1": [
        {
            id: "Resource_Group_A",
            name: "Resource_Group_A",
            location: "centralIndia",
        },
        {
            id: "Resource_Group_B",
            name: "Resource_Group_B",
            location: "eastUS",
        },
        {
            id: "Resource_Group_C",
            name: "Resource_Group_C",
            location: "northEurope",
        },
    ],
    "/fake/sub2": [
        {
            id: "Resource_Group_D",
            name: "Resource_Group_D",
            location: "eastUS",
        },
        {
            id: "Resource_Group_E",
            name: "Resource_Group_E",
            location: "westUS",
        },
    ],
    "/fake/sub3": [
        {
            id: "Resource_Group_F",
            name: "Resource_Group_F",
            location: "brazilSouth",
        },
        {
            id: "Resource_Group_G",
            name: "Resource_Group_G",
            location: "eastUS",
        },
        {
            id: "Resource_Group_H",
            name: "Resource_Group_H",
            location: "eastAsia",
        },
        {
            id: "Resource_Group_I",
            name: "Resource_Group_I",
            location: "koreaSouth",
        },
    ],
};

export class FakeResourceGroupService implements ResourceGroupService {
    public list(subscriptionId: string): Promise<ResourceGroup[]> {
        return Promise.resolve(
            subscriptionId in resourceGroups
                ? resourceGroups[subscriptionId]
                : []
        );
    }

    public async get(id: string): Promise<ResourceGroup | null> {
        return null;
    }

    public async create(account: ResourceGroup): Promise<void> {
        return;
    }
    public async remove(account: ResourceGroup): Promise<void> {
        return;
    }
    public async update(account: ResourceGroup): Promise<void> {
        return;
    }
}
