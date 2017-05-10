import { List } from "immutable";
import { Duration } from "moment";

import { Attr, Model, Record, ListAttr } from "app/core"
import { ModelUtils } from "app/utils";
import { CloudServiceConfiguration } from "./cloud-service-configuration";
import { Metadata, MetadataAttributes } from "./metadata";
import { ResizeError } from "./resize-error";
import { StartTask } from "./start-task";
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
    startTask: StartTask;
    metadata: MetadataAttributes[];
    userAccounts: UserAccountAttributes[];
}

/**
 * Class for displaying Batch pool information.
 */
@Model()
export class Pool extends Record {
    @Attr()
    public allocationState: string;
    @Attr()
    public allocationStateTransitionTime: Date;
    @Attr()
    public applicationPackageReferences: any[];
    @Attr()
    public certificateReferences: any[];
    @Attr()
    public cloudServiceConfiguration: CloudServiceConfiguration;
    @Attr()
    public creationTime: Date;
    @Attr()
    public currentDedicated: number;
    @Attr()
    public displayName: string;
    @Attr()
    public enableAutoScale: boolean;
    @Attr()
    public enableInterNodeCommunication: boolean;
    @Attr()
    public id: string;
    @Attr()
    public lastModified: Date;
    @Attr()
    public maxTasksPerNode: number = 1;
    @Attr()
    public resizeError: ResizeError;
    @Attr()
    public resizeTimeout: Duration;
    @Attr()
    public state: string;
    @Attr()
    public stateTransitionTime: Date;
    @Attr()
    public targetDedicated: number = 0;
    @Attr()
    public autoScaleFormula: string;
    @Attr()
    public autoScaleEvaluationInterval: Duration;
    @Attr()
    public taskSchedulingPolicy: any;
    @Attr()
    public url: string;
    @Attr()
    public virtualMachineConfiguration: VirtualMachineConfiguration;
    @Attr()
    public vmSize: string;
    @Attr()
    public startTask: StartTask;
    @ListAttr(Metadata)
    public metadata: List<Metadata> = List([]);

    @ListAttr(UserAccount)
    public userAccounts: List<UserAccount> = List([]);

    /**
     * Tags are computed from the metadata using an internal key
     */
    public tags: List<string> = List([]);

    constructor(data: Partial<PoolAttributes> = {}) {
        super(data);
        this.tags = ModelUtils.tagsFromMetadata(this.metadata);
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
