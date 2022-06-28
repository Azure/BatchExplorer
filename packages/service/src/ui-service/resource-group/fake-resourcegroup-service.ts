import { ResourceGroup } from "./resourcegroup-model";
import { ResourceGroupService } from "./resourcegroup-service";

const resourceGroups: { [key: string]: ResourceGroup[] } = {
    "/fake/sub1": [
        {
            id: "/fake/resourcegroupA",
            name: "Resource Group A",
            location: "centralIndia",
        },
        {
            id: "/fake/resourcegroupB",
            name: "Resource Group B",
            location: "eastUS",
        },
        {
            id: "/fake/resourcegroupC",
            name: "Resource Group C",
            location: "northEurope",
        },
    ],
    "/fake/sub2": [
        {
            id: "/fake/resourcegroupD",
            name: "Resource Group D",
            location: "eastUS",
        },
        {
            id: "/fake/resourcegroupE",
            name: "Resource Group E",
            location: "westUS",
        },
    ],
    "/fake/sub3": [
        {
            id: "/fake/resourcegroupF",
            name: "Resource Group F",
            location: "brazilSouth",
        },
        {
            id: "/fake/resourcegroupG",
            name: "Resource Group G",
            location: "eastUS",
        },
        {
            id: "/fake/resourcegroupH",
            name: "Resource Group H",
            location: "eastAsia",
        },
        {
            id: "/fake/resourcegroupI",
            name: "Resource Group I",
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
