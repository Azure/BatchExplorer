import { Record } from "immutable";
import { Duration } from "moment";

import { CloudServiceConfiguration } from "./cloudServiceConfiguration";
import { ResizeError } from "./resizeError";
import { VirtualMachineConfiguration } from "./virtualMachineConfiguration";
import { StartTask } from "./startTask";

// tslint:disable:variable-name object-literal-sort-keys
const PoolRecord = Record({
    allocationState: null,
    allocationStateTransitionTime: null,
    applicationPackageReferences: [],
    certificateReferences: [],
    cloudServiceConfiguration: null,
    creationTime: null,
    currentDedicated: 0,
    displayName: null,
    enableAutoscale: false,
    enableInterNodeCommunication: false,
    id: null,
    lastModified: null,
    maxTasksPerNode: 1,
    resizeError: null,
    resizeTimeout: null,
    state: null,
    stateTransitionTime: null,
    targetDedicated: 0,
    taskSchedulingPolicy: null,
    url: null,
    virtualMachineConfiguration: null,
    vmSize: null,
    startTask: null,
    metadata: [],
});

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
    public enableAutoscale: boolean;
    public enableInterNodeCommunication: boolean;
    public id: string;
    public lastModified: Date;
    public maxTasksPerNode: number;
    public resizeError: ResizeError;
    public resizeTimeout: Duration;
    public state: string;
    public stateTransitionTime: Date;
    public targetDedicated: number;
    public taskSchedulingPolicy: any;
    public url: string;
    public virtualMachineConfiguration: VirtualMachineConfiguration;
    public vmSize: string;
    public startTask: StartTask;
    public metadata: any[];

    constructor(data: any = {}) {
        super(Object.assign({}, data, {
            resizeError: data.resizeError && new ResizeError(data.resizeError),
            startTask: data.startTask && new StartTask(data.startTask),
        }));
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
