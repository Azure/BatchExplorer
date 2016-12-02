
import { Record } from "immutable";

// tslint:disable:variable-name object-literal-sort-keys
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

/**
 * Class for displaying Batch node information.
 */
export class Node extends NodeRecord {
    public id: string;
    public state: string;
    public totalTasksRun: number;
    public schedulingState: string;
    public vmSize: string;
    public url: string;
    public stateTransitionTime: Date;
    public lastBootTime: Date;
    public allocationTime: Date;
    public ipAddress: string;
    public affinityId: string;
}

export type NodeState = "creating" | "starting" | "waitingforstarttask" | "starttaskfailed" |
    "idle" | "leavingpool" | "rebooting" | "reimaging" | "running" | "unknown" | "unusable";

export const NodeState = {
    creating: "creating" as NodeState,
    starting: "starting" as NodeState,
    waitingForStartTask: "waitingforstarttask" as NodeState,
    startTaskFailed: "starttaskfailed" as NodeState,
    idle: "idle" as NodeState,
    leavingPool: "leavingpool" as NodeState,
    rebooting: "rebooting" as NodeState,
    reimaging: "reimaging" as NodeState,
    running: "running" as NodeState,
    unknown: "unknown" as NodeState,
    unusable: "unusable" as NodeState,
};
