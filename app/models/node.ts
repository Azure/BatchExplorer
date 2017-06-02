import { Iterable, List } from "immutable";

import { ListProp, Model, Prop, Record } from "app/core";
import { NodeRecentTask } from "app/models/node-recent-task";
import { TaskState } from "app/models/task";

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
    recentTasks: Array<Partial<NodeRecentTask>>;
    isPreemptible: boolean;
}

/**
 * Class for displaying Batch node information.
 */
@Model()
export class Node extends Record<NodeAttributes> {
    @Prop() public id: string;
    @Prop() public state: NodeState;
    @Prop() public totalTasksRun: number;
    @Prop() public schedulingState: string;
    @Prop() public vmSize: string;
    @Prop() public url: string;
    @Prop() public stateTransitionTime: Date;
    @Prop() public lastBootTime: Date;
    @Prop() public allocationTime: Date;
    @Prop() public ipAddress: string;
    @Prop() public affinityId: string;
    @ListProp(NodeRecentTask) public recentTasks: List<NodeRecentTask> = List([]);
    @Prop() public isPreemptible: boolean;

    public get runningTasks(): Iterable<number, NodeRecentTask> {
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
