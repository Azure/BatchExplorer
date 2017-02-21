import { Record } from "immutable";

import { Partial } from "app/utils";

const NodeRecord = Record({
    id: null,
    state: null,
    totalTasksRun: 0,
    schedulingState: null,
    vmSize: null,
    url: null,
    stateTransitionTime: null,
    lastBootTime: null,
    allocationTime: null,
    ipAddress: null,
    affinityId: null,
});

export interface NodeAttributes {
    id: string;
    state: NodeState;
    totalTasksRun: number;
    schedulingState: string;
    vmSize: string;
    url: string;
    stateTransitionTime: Date;
    lastBootTime: Date;
    allocationTime: Date;
    ipAddress: string;
    affinityId: string;
}

/**
 * Class for displaying Batch node information.
 */
export class Node extends NodeRecord implements NodeAttributes {
    public id: string;
    public state: NodeState;
    public totalTasksRun: number;
    public schedulingState: string;
    public vmSize: string;
    public url: string;
    public stateTransitionTime: Date;
    public lastBootTime: Date;
    public allocationTime: Date;
    public ipAddress: string;
    public affinityId: string;

    constructor(data: Partial<NodeAttributes>) {
        super(data);
    }
}

export type NodeState = "creating" | "starting" | "waitingforstarttask" | "starttaskfailed" |
    "idle" | "offline" | "leavingpool" | "rebooting" | "reimaging" | "running" | "unknown" | "unusable";

export const NodeState = {
    creating: "creating" as NodeState,
    starting: "starting" as NodeState,
    waitingForStartTask: "waitingforstarttask" as NodeState,
    startTaskFailed: "starttaskfailed" as NodeState,
    idle: "idle" as NodeState,
    offline: "offline" as NodeState,
    leavingPool: "leavingpool" as NodeState,
    rebooting: "rebooting" as NodeState,
    reimaging: "reimaging" as NodeState,
    running: "running" as NodeState,
    unknown: "unknown" as NodeState,
    unusable: "unusable" as NodeState,
};
