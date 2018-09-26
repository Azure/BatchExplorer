import { Model, Prop, Record } from "@batch-flask/core";

export enum StorageAccountType {
    PremiumLrs = "premium_lrs",
    StandardLrs = "standard_lrs",
}

export enum CachingType {
    None = "none",
    Readonly = "readonly",
    Readwrite = "readwrite",
}

export interface DataDiskAttributes {
    diskSizeGB: number;
    lun: number;
    storageAccountType: StorageAccountType;
    caching: CachingType;
}

@Model()
export class DataDisk extends Record<DataDiskAttributes> {
    @Prop() public diskSizeGB: number;
    @Prop() public lun: number;
    @Prop() public storageAccountType: StorageAccountType;
    @Prop() public caching: CachingType;
}
