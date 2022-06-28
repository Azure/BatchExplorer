export interface ResourceGroup {
    id: string;
    location: string;
    name: string;
}

//For more information, see: https://docs.microsoft.com/en-us/rest/api/resources/resource-groups/create-or-update
//TODO: May remove location from this list as it is set by the location dropdown
