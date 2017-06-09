import { ArmRecord, Model, Prop, Record } from "app/core";
import { Subscription } from "./subscription";

export type AccountProvisingState = "Succeeded";
export const AccountProvisingState = {
    Succeeded: "Succeeded" as AccountProvisingState,
};

export interface AutoStorageAccountAttributes {
    storageAccountId: string;
    lastKeySync: Date;
}

@Model()
export class AutoStorageAccount extends Record<AutoStorageAccountAttributes> {
    @Prop() public storageAccountId: string;
    @Prop() public lastKeySync: Date;
}

export interface BatchAccountPropertiesAttributes {
    accountEndpoint: string;
    provisioningState: AccountProvisingState;
    dedicatedCoreQuota: number;
    lowPriorityCoreQuota: number;
    poolQuota: number;
    activeJobAndJobScheduleQuota: number;
    autoStorage: AutoStorageAccountAttributes;
}

@Model()
export class BatchAccountProperties extends Record<BatchAccountPropertiesAttributes> {
    @Prop() public accountEndpoint: string;
    @Prop() public provisioningState: AccountProvisingState;
    @Prop() public dedicatedCoreQuota: number = 20;
    @Prop() public lowPriorityCoreQuota: number = 100;
    @Prop() public poolQuota: number = 20;
    @Prop() public activeJobAndJobScheduleQuota: number = 20;
    @Prop() public autoStorage: AutoStorageAccount;
}

export interface BatchAccountAttributes {
    id: string;
    name: string;
    location: string;
    type: string;
    properties: BatchAccountPropertiesAttributes;
    subscription: Subscription;
}

@Model()
export class AccountResource extends ArmRecord<BatchAccountAttributes> {
    public type: "Microsoft.Batch/batchAccounts";

    @Prop() public id: string;
    @Prop() public name: string;
    @Prop() public location: string;
    @Prop() public properties: BatchAccountProperties;
    @Prop() public subscription: Subscription;
}
