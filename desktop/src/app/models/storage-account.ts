import { ArmRecord, ArmRecordAttributes, Model, Prop, Record } from "@batch-flask/core";

interface PrimaryEndpointsAttributes {
    blob: string;
    file: string;
    queue: string;
    table: string;
}

interface StorageAccountPropertiesAttributes {
    creationTime: Date;
    primaryLocation: string;
    provisioningState: string;
    secondaryLocation: string;
    statusOfPrimary: string;
    statusOfSecondary: string;
    supportsHttpsTrafficOnly: boolean;
    primaryEndpoints: PrimaryEndpointsAttributes;
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

    @Prop() public primaryEndpoints: PrimaryEndpointsAttributes;
}

export interface StorageAccountAttributes extends ArmRecordAttributes {
    location: string;
    name: string;
    kind: string;
    properties: Partial<StorageAccountPropertiesAttributes>;
    type: ArmStorageAccountType;
}

export type ArmStorageAccountType = "Microsoft.Storage/storageAccounts" | "Microsoft.ClassicStorage/storageAccounts";

@Model()
export class StorageAccount extends ArmRecord<StorageAccountAttributes> {
    @Prop() public id: string;

    @Prop() public location: string;

    @Prop() public name: string;

    @Prop() public kind: string;

    @Prop() public properties: StorageAccountProperties;

    public type: ArmStorageAccountType;
    public isClassic: boolean;

    constructor(data: StorageAccountAttributes) {
        super(data);
        this.isClassic = this.type === "Microsoft.ClassicStorage/storageAccounts";
    }
}
