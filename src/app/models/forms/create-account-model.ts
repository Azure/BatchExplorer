import { AccountCreateDto } from "app/models/dtos";
import { ArmLocation } from "../arm-location";
import { ArmSubscription } from "../arm-subscription";
import { ResourceGroup } from "../resource-group";

export interface CreateAccountModel {
    name: string;
    subscription: ArmSubscription;
    location: ArmLocation;
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
