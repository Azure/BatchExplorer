import { ArmRecord, Model, Prop, Record } from "app/core";

interface StorageAccountPropertiesAttributes {
    creationTime: Date;
    primaryLocation: string;
    provisioningState: string;
    secondaryLocation: string;
    statusOfPrimary: string;
    statusOfSecondary: string;
    supportsHttpsTrafficOnly: boolean;
}

@Model()
class StorageAccountProperties extends Record<StorageAccountPropertiesAttributes> {
    @Prop() public creationTime: Date;

    @Prop() public primaryLocation: string;

    @Prop() public provisioningState: string;

    @Prop() public secondaryLocation: string;

    @Prop() public statusOfPrimary: string;

    @Prop() public statusOfSecondary: string;

    @Prop() public supportsHttpsTrafficOnly: boolean;
}

export interface StorageAccountAttributes {
    id: string;
    location: string;
    name: string;
    kind: string;
    properties: Partial<StorageAccountPropertiesAttributes>;
}

@Model()
export class StorageAccount extends ArmRecord<StorageAccountAttributes> {
    @Prop() public id: string;

    @Prop() public location: string;

    @Prop() public name: string;

    @Prop() public kind: string;

    @Prop() public properties: StorageAccountProperties;
}
