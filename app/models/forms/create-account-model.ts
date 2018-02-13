import { ResourceGroupMode } from "app/components/account/action/add";
import { Location, ResourceGroup, Subscription } from "app/models";
import { AccountCreateDto } from "app/models/dtos";

export interface CreateAccountModel {
    name: string;
    subscription: Subscription;
    location: Location;
    resourceGroupMode: ResourceGroupMode;
    newResourceGroup: string;
    resourceGroup: ResourceGroup;
}

export function createAccountFormToJsonData(formData: CreateAccountModel): AccountCreateDto {
    const data: any = {
        location: formData.location.name,
    };
    return new AccountCreateDto(data);
}
