export interface Location {
    id: string;
    name: string;
    displayName: string;
    regionalDisplayName: string;
    metadata: {
        regionType: string;
        regionCategory: string;
        geographyGroup: string;
        longitude: string;
        latitude: string;
        physicalLocation: string;
        pairedRegion: [
            {
                name: string;
                id: string;
            }
        ];
    };
}

//Location interface taken from here: https://docs.microsoft.com/en-us/rest/api/resources/subscriptions/list-locations
