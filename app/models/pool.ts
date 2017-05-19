import { List } from "immutable";
import { Duration } from "moment";

import { ListProp, Model, Prop, Record } from "app/core";
import { ModelUtils, PoolUtils } from "app/utils";
import { CloudServiceConfiguration } from "./cloud-service-configuration";
import { Metadata, MetadataAttributes } from "./metadata";
import { ResizeError } from "./resize-error";
import { StartTask, StartTaskAttributes } from "./start-task";
import { UserAccount, UserAccountAttributes } from "./user-account";
import { VirtualMachineConfiguration, VirtualMachineConfigurationAttributes } from "./virtual-machine-configuration";

export interface PoolAttributes {
    allocationState: string;
    allocationStateTransitionTime: Date;
    applicationPackageReferences: any[];
    certificateReferences: any[];
    cloudServiceConfiguration: Partial<CloudServiceConfiguration>;
    creationTime: Date;
    currentDedicated: number;
    displayName: string;
    enableAutoscale: boolean;
    enableInterNodeCommunication: boolean;
    id: string;
    lastModified: Date;
    maxTasksPerNode: number;
    resizeError: Partial<ResizeError>;
    resizeTimeout: Duration;
    state: string;
    stateTransitionTime: Date;
    targetDedicated: number;
    taskSchedulingPolicy: any;
    url: string;
    virtualMachineConfiguration: Partial<VirtualMachineConfigurationAttributes>;
    vmSize: string;
    startTask: Partial<StartTaskAttributes>;
    metadata: MetadataAttributes[];
    userAccounts: UserAccountAttributes[];
}

/**
 * Class for displaying Batch pool information.
 */
@Model()
export class Pool extends Record<PoolAttributes> {
    @Prop()
    public allocationState: string;
    @Prop()
    public allocationStateTransitionTime: Date;
    @ListProp(Object)
    public applicationPackageReferences: List<any>;
    @ListProp(Object)
    public certificateReferences: List<any>;
    @Prop()
    public cloudServiceConfiguration: CloudServiceConfiguration;
    @Prop()
    public creationTime: Date;
    @Prop()
    public currentDedicated: number;
    @Prop()
    public displayName: string;
    @Prop()
    public enableAutoScale: boolean;
    @Prop()
    public enableInterNodeCommunication: boolean;
    @Prop()
    public id: string;
    @Prop()
    public lastModified: Date;
    @Prop()
    public maxTasksPerNode: number = 1;
    @Prop()
    public resizeError: ResizeError;
    @Prop()
    public resizeTimeout: Duration;
    @Prop()
    public state: string;
    @Prop()
    public stateTransitionTime: Date;
    @Prop()
    public targetDedicated: number = 0;
    @Prop()
    public autoScaleFormula: string;
    @Prop()
    public autoScaleEvaluationInterval: Duration;
    @Prop()
    public taskSchedulingPolicy: any;
    @Prop()
    public url: string;
    @Prop()
    public virtualMachineConfiguration: VirtualMachineConfiguration;
    @Prop()
    public vmSize: string;
    @Prop()
    public startTask: StartTask;
    @ListProp(Metadata)
    public metadata: List<Metadata> = List([]);
    @ListProp(UserAccount)
    public userAccounts: List<UserAccount> = List([]);

    /**
     * Tags are computed from the metadata using an internal key
     */
    public tags: List<string> = List([]);

    private _osName: string;
    private _osIcon: string;

    constructor(data: Partial<PoolAttributes> = {}) {
        super(data);
        this.tags = ModelUtils.tagsFromMetadata(this.metadata);
        this._osName = PoolUtils.getOsName(this);
        this._osIcon = PoolUtils.getComputePoolOsIcon(this._osName);
    }

    public osIconName(): string {
        return this._osIcon;
    }

    public osName(): string {
        return this._osName;
    }
}

export type PoolState = "active" | "upgrading" | "deleting";
export const PoolState = {
    active: "active" as PoolState,
    upgrading: "upgrading" as PoolState,
    deleting: "deleting" as PoolState,
};

export type PoolAllocationState = "resizing" | "stopping" | "steady";
export const PoolAllocationState = {
    resizing: "resizing" as PoolAllocationState,
    stopping: "stopping" as PoolAllocationState,
    steady: "steady" as PoolAllocationState,
};
