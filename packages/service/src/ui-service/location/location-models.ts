export interface Location {
    id: string;
    name: string;
    displayName: string;
    regionalDisplayName: string;
    metadata: {
        regionType: "Logical" | "Manifest" | "Physical";
        regionCategory: "ServiceProvided" | "Recommended" | "Other";
        geographyGroup?: string;
        physicalLocation?: string;
    };
}
