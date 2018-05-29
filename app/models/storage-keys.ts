import { Model, Prop, Record } from "@batch-flask/core";

export interface StorageKeysAttributes {
    primaryKey: string;
    secondaryKey: string;
}

/**
 * Class for storing storage account access keys returned from ARM /listkeys operation
 */
@Model()
export class StorageKeys extends Record<StorageKeysAttributes> {
    @Prop() public primaryKey: string;
    @Prop() public secondaryKey: string;
}
