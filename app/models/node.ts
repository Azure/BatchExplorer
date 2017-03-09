import { List, Record } from "immutable";

import { NodeRecentTask } from "app/models/node-recent-task";
import { TaskState } from "app/models/task";

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
    recentTasks: null,
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
    recentTasks: List<NodeRecentTask>;
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
    public recentTasks: List<NodeRecentTask>;

    constructor(data: Partial<NodeAttributes>) {
        super(Object.assign({}, data, {
            recentTasks: List(data.recentTasks && data.recentTasks.map(x => new NodeRecentTask(x))),
        }));
    }

    public get runningTasks() {
        return this.recentTasks.filter(x => x.taskState === TaskState.running);
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
