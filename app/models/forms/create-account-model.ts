import { Location, ResourceGroup, Subscription } from "app/models";
import { AccountCreateDto } from "app/models/dtos";

export interface CreateAccountModel {
    name: string;
    subscription: Subscription;
    location: Location;
    resourceGroup: ResourceGroup | string;
    storageAccountId: string;
}

export function createAccountFormToJsonData(formData: CreateAccountModel): AccountCreateDto {
    const data: any = {
        location: formData.location.name,
    };

    if (formData.storageAccountId) {
        data.properties = {
            autoStorage: {
                storageAccountId: formData.storageAccountId,
            },
        };
    }
    return new AccountCreateDto(data);
}
