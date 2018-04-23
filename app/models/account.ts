import { ArmRecord, Model, Prop, Record } from "@batch-flask/core";
import { StorageUtils } from "app/utils";
import { Subscription } from "./subscription";

export enum PoolAllocationMode {
    BatchService = "batchservice",
    UserSubscription = "usersubscription",
}

export enum AccountProvisingState {
    Invalid = "Invalid",
    Creating = "Creating",
    Deleting = "Deleting",
    Succeeded = "Succeeded",
    Failed = "Failed",
    Cancelled = "Cancelled",
}

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
    poolAllocationMode: PoolAllocationMode;
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
    @Prop() public poolAllocationMode: PoolAllocationMode;
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

    public get isBatchManaged() {
        return this.properties && this.properties.poolAllocationMode === PoolAllocationMode.BatchService;
    }

    public get autoStorage() {
        return this.properties && this.properties.autoStorage;
    }

    public hasArmAutoStorage(): boolean {
        return Boolean(this.autoStorage
            && !StorageUtils.isClassic(this.autoStorage.storageAccountId));
    }

    public get subscriptionId(): string {
        return this.subscription && this.subscription.subscriptionId;
    }
}
