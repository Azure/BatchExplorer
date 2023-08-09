export interface ResourceGroup {
    id: string;
    name: string;
    type: "Microsoft.Resources/resourceGroups";
    properties: {
        provisioningState: string;
    };
    location: string;
    managedBy?: string;
    tags?: Record<string, string>;
}
