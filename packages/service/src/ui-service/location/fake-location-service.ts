import { Location } from "./location-model";
import { LocationService } from "./location-service";

const locations: { [key: string]: Location[] } = {
    "/fake/sub1": [
        {
            id: "/subscriptions/fake/sub1/locations/eastasia",
            name: "eastasia",
            displayName: "East Asia",
            regionalDisplayName: "(Asia Pacific) East Asia",
            metadata: {
                regionType: "Physical",
                regionCategory: "Recommended",
                geographyGroup: "Asia Pacific",
                longitude: "114.188",
                latitude: "22.267",
                physicalLocation: "Hong Kong",
                pairedRegion: [
                    {
                        name: "southeastasia",
                        id: "/subscriptions/fake/sub1/locations/southeastasia",
                    },
                ],
            },
        },
        {
            id: "/subscriptions/fake/sub1/locations/westus",
            name: "westus",
            displayName: "West US",
            regionalDisplayName: "(US) West US",
            metadata: {
                regionType: "Physical",
                regionCategory: "Recommended",
                geographyGroup: "US",
                longitude: "37.2551",
                latitude: "-119.61752",
                physicalLocation: "California",
                pairedRegion: [
                    {
                        name: "centralus",
                        id: "/subscriptions/fake/sub1/locations/centralus",
                    },
                ],
            },
        },
    ],

    "/fake/sub2": [
        {
            id: "/subscriptions/fake/sub2/locations/centralus",
            name: "centralus",
            displayName: "Central US",
            regionalDisplayName: "(US) Central US",
            metadata: {
                regionType: "Physical",
                regionCategory: "Recommended",
                geographyGroup: "US",
                longitude: "-93.6208",
                latitude: "41.5908",
                physicalLocation: "Iowa",
                pairedRegion: [
                    {
                        name: "eastus2",
                        id: "/subscriptions/fake/sub2/locations/eastus2",
                    },
                ],
            },
        },
        {
            id: "/subscriptions/fake/sub2/locations/eastasia",
            name: "eastasia",
            displayName: "East Asia",
            regionalDisplayName: "(Asia Pacific) East Asia",
            metadata: {
                regionType: "Physical",
                regionCategory: "Recommended",
                geographyGroup: "Asia Pacific",
                longitude: "114.188",
                latitude: "22.267",
                physicalLocation: "Hong Kong",
                pairedRegion: [
                    {
                        name: "southeastasia",
                        id: "/subscriptions/fake/sub2/locations/southeastasia",
                    },
                ],
            },
        },
        {
            id: "/subscriptions/fake/sub2/locations/westus",
            name: "westus",
            displayName: "West US",
            regionalDisplayName: "(US) West US",
            metadata: {
                regionType: "Physical",
                regionCategory: "Recommended",
                geographyGroup: "US",
                longitude: "37.2551",
                latitude: "-119.61752",
                physicalLocation: "California",
                pairedRegion: [
                    {
                        name: "centralus",
                        id: "/subscriptions/fake/sub2/locations/centralus",
                    },
                ],
            },
        },
    ],

    "/fake/sub3": [
        {
            id: "/subscriptions/fake/sub3/locations/centralus",
            name: "centralus",
            displayName: "Central US",
            regionalDisplayName: "(US) Central US",
            metadata: {
                regionType: "Physical",
                regionCategory: "Recommended",
                geographyGroup: "US",
                longitude: "-93.6208",
                latitude: "41.5908",
                physicalLocation: "Iowa",
                pairedRegion: [
                    {
                        name: "eastus2",
                        id: "/subscriptions/fake/sub3/locations/eastus2",
                    },
                ],
            },
        },
        {
            id: "/subscriptions/fake/sub3/locations/eastasia",
            name: "eastasia",
            displayName: "East Asia",
            regionalDisplayName: "(Asia Pacific) East Asia",
            metadata: {
                regionType: "Physical",
                regionCategory: "Recommended",
                geographyGroup: "Asia Pacific",
                longitude: "114.188",
                latitude: "22.267",
                physicalLocation: "Hong Kong",
                pairedRegion: [
                    {
                        name: "southeastasia",
                        id: "/subscriptions/fake/sub3/locations/southeastasia",
                    },
                ],
            },
        },
    ],
    "/fake/sub4": [
        {
            id: "/subscriptions/fake/sub4/locations/centralus",
            name: "centralus",
            displayName: "Central US",
            regionalDisplayName: "(US) Central US",
            metadata: {
                regionType: "Physical",
                regionCategory: "Recommended",
                geographyGroup: "US",
                longitude: "-93.6208",
                latitude: "41.5908",
                physicalLocation: "Iowa",
                pairedRegion: [
                    {
                        name: "eastus2",
                        id: "/subscriptions/fake/sub4/locations/eastus2",
                    },
                ],
            },
        },
        {
            id: "/subscriptions/fake/sub4/locations/eastasia",
            name: "eastasia",
            displayName: "East Asia",
            regionalDisplayName: "(Asia Pacific) East Asia",
            metadata: {
                regionType: "Physical",
                regionCategory: "Recommended",
                geographyGroup: "Asia Pacific",
                longitude: "114.188",
                latitude: "22.267",
                physicalLocation: "Hong Kong",
                pairedRegion: [
                    {
                        name: "southeastasia",
                        id: "/subscriptions/fake/sub4/locations/southeastasia",
                    },
                ],
            },
        },
        {
            id: "/subscriptions/fake/sub4/locations/westus",
            name: "westus",
            displayName: "West US",
            regionalDisplayName: "(US) West US",
            metadata: {
                regionType: "Physical",
                regionCategory: "Recommended",
                geographyGroup: "US",
                longitude: "37.2551",
                latitude: "-119.61752",
                physicalLocation: "California",
                pairedRegion: [
                    {
                        name: "centralus",
                        id: "/subscriptions/fake/sub4/locations/centralus",
                    },
                ],
            },
        },
    ],
};

export class FakeLocationService implements LocationService {
    public list(subscriptionId: string): Promise<Location[]> {
        return Promise.resolve(
            subscriptionId in locations ? locations[subscriptionId] : []
        );
    }

    public async get(id: string): Promise<Location | null> {
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
