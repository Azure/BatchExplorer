import { AccountCreateDto } from "app/models/dtos";
import { Location } from "../location";
import { ResourceGroup } from "../resource-group";
import { Subscription } from "../subscription";

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
