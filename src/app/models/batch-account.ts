import { ArmRecord, Model, Prop, Record } from "@batch-flask/core";
import { ArmResourceUtils, StorageUtils } from "app/utils";
import { ArmSubscription } from "./arm-subscription";

export enum PoolAllocationMode {
    BatchService = "BatchService",
    UserSubscription = "UserSubscription",
}

export enum BatchAccountProvisingState {
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

export const LOCAL_BATCH_ACCOUNT_PREFIX = "local/";

@Model()
export class AutoStorageAccount extends Record<AutoStorageAccountAttributes> {
    @Prop() public storageAccountId: string;
    @Prop() public lastKeySync: Date;
}

export interface BatchAccountPropertiesAttributes {
    accountEndpoint: string;
    provisioningState: BatchAccountProvisingState;
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
    @Prop() public provisioningState: BatchAccountProvisingState;
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
    type?: string;
    properties: BatchAccountPropertiesAttributes;
    subscription: ArmSubscription;
}

export interface BatchAccount extends Record<any> {
    id: string;
    name: string;
    displayName: string;
    url: string;
    provisioningState: BatchAccountProvisingState;
    armEnabled: boolean;
    autoStorage: AutoStorageAccount | null;
    hasArmAutoStorage: () => boolean;
}

@Model()
export class ArmBatchAccount extends ArmRecord<BatchAccountAttributes> implements BatchAccount {
    public type: "Microsoft.Batch/batchAccounts";
    public armEnabled = true;

    @Prop() public id: string;
    @Prop() public name: string;
    @Prop() public location: string;
    @Prop() public properties: BatchAccountProperties;
    @Prop() public subscription: ArmSubscription;
    public readonly resourceGroup: string | null;

    constructor(data: BatchAccountAttributes) {
        super(data);
        this.resourceGroup = ArmResourceUtils.getResourceGroupFromResourceId(this.id) || null;
    }

    public get isBatchManaged() {
        return this.properties && this.properties.poolAllocationMode === PoolAllocationMode.BatchService;
    }

    public get autoStorage() {
        return this.properties && this.properties.autoStorage;
    }

    public get displayName() {
        return this.name;
    }

    public hasArmAutoStorage(): boolean {
        return Boolean(this.autoStorage
            && !StorageUtils.isClassic(this.autoStorage.storageAccountId));
    }

    public get subscriptionId(): string {
        return this.subscription && this.subscription.subscriptionId;
    }

    public get routerLink(): string[] {
        return ["/accounts", this.id];
    }

    public get url() {
        return `https://${this.properties && this.properties.accountEndpoint}`;
    }

    public get provisioningState() {
        return this.properties && this.properties.provisioningState;
    }
}

@Model()
export class LocalBatchAccount extends Record<any> implements BatchAccount {
    @Prop() public name: string;
    @Prop() public displayName: string;
    @Prop() public url: string;
    @Prop() public key: string;

    public armEnabled = false;
    public provisioningState = BatchAccountProvisingState.Succeeded;
    public autoStorage = null;

    public get id(): string {
        return `${LOCAL_BATCH_ACCOUNT_PREFIX}${this.url}`;
    }

    public get routerLink(): string[] {
        return ["/accounts", this.id];
    }

    public hasArmAutoStorage() {
        return false;
    }
}
