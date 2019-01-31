import { ArmRecord, Model, Prop, Record } from "@batch-flask/core";

export interface BatchApplicationPackageAttributes {
    id: string;
    name: string;
    version: string;
}

export interface BatchApplicationPackagePropertiesAttributes {
    state: PackageState;
    format: string;
    lastActivationTime: Date;
    storageUrl: string;
    storageUrlExpiry: Date;
}

@Model()
export class BatchApplicationPackageProperties extends Record<BatchApplicationPackagePropertiesAttributes> {
    @Prop() public state: PackageState;
    @Prop() public format: string;
    @Prop() public lastActivationTime: Date;
    @Prop() public storageUrl: string;
    @Prop() public storageUrlExpiry: Date;
}

/**
 * Class for displaying Batch application package information.
 */
@Model()
export class BatchApplicationPackage extends ArmRecord<BatchApplicationPackageAttributes> {
    @Prop() public id: string;
    @Prop() public name: string;
    @Prop() public properties: BatchApplicationPackageProperties;

    public get applicationId(): string {
        // Remove the versions/{id}
        return this.id.split("/").slice(0, -2).join("/");
    }
}

export enum PackageState {
    active = "active",
    pending = "pending",
}
