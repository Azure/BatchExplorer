import { List, Record } from "immutable";
import { Duration } from "moment";

import { ModelUtils } from "app/utils";
import { CloudServiceConfiguration } from "./cloud-service-configuration";
import { Metadata, MetadataAttributes } from "./metadata";
import { ResizeError } from "./resize-error";
import { StartTask } from "./start-task";
import { UserAccount, UserAccountAttributes } from "./user-account";
import { VirtualMachineConfiguration, VirtualMachineConfigurationAttributes } from "./virtual-machine-configuration";

const PoolRecord = Record({
    allocationState: null,
    allocationStateTransitionTime: null,
    applicationPackageReferences: [],
    certificateReferences: [],
    cloudServiceConfiguration: null,
    creationTime: null,
    currentDedicated: 0,
    displayName: null,
    enableAutoScale: false,
    enableInterNodeCommunication: false,
    id: null,
    lastModified: null,
    maxTasksPerNode: 1,
    resizeError: null,
    resizeTimeout: null,
    state: null,
    stateTransitionTime: null,
    targetDedicated: 0,
    autoScaleEvaluationInterval: null,
    autoScaleFormula: null,
    taskSchedulingPolicy: null,
    url: null,
    virtualMachineConfiguration: null,
    vmSize: null,
    startTask: null,
    metadata: List([]),
    userAccounts: List([]),
});

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
    userAccounts: UserAccountAttributes[],
}

/**
 * Class for displaying Batch pool information.
 */
export class Pool extends PoolRecord {
    public allocationState: string;
    public allocationStateTransitionTime: Date;
    public applicationPackageReferences: any[];
    public certificateReferences: any[];
    public cloudServiceConfiguration: CloudServiceConfiguration;
    public creationTime: Date;
    public currentDedicated: number;
    public displayName: string;
    public enableAutoScale: boolean;
    public enableInterNodeCommunication: boolean;
    public id: string;
    public lastModified: Date;
    public maxTasksPerNode: number;
    public resizeError: ResizeError;
    public resizeTimeout: Duration;
    public state: string;
    public stateTransitionTime: Date;
    public targetDedicated: number;
    public autoScaleFormula: string;
    public autoScaleEvaluationInterval: Duration;
    public taskSchedulingPolicy: any;
    public url: string;
    public virtualMachineConfiguration: VirtualMachineConfiguration;
    public vmSize: string;
    public startTask: StartTask;
    public metadata: List<Metadata>;
    public userAccounts: List<UserAccount>;

    /**
     * Tags are computed from the metadata using an internal key
     */
    public tags: List<string> = List([]);

    constructor(data: Partial<PoolAttributes> = {}) {
        super(Object.assign({}, data, {
            resizeError: data.resizeError && new ResizeError(data.resizeError),
            startTask: data.startTask && new StartTask(data.startTask),
            metadata: List(data.metadata && data.metadata.map(x => new Metadata(x))),
            userAccounts: List(data.userAccounts && data.userAccounts.map(x => new UserAccount(x))),
        }));
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
