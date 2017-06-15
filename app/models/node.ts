import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "app/core";
import { CertificateReference } from "app/models/certificate-reference";
import { NodeRecentTask } from "app/models/node-recent-task";
import { StartTaskInfo } from "app/models/start-task-info";

export interface NodeAttributes {
    id: string;
    url: string;
    state: NodeState;
    schedulingState: string;
    stateTransitionTime: Date;
    lastBootTime: Date;
    allocationTime: Date;
    ipAddress: string;
    affinityId: string;
    vmSize: string;
    totalTasksRun: number;
    totalTasksSucceeded: number;
    runningTasksCount: number;
    isDedicated: boolean;
    recentTasks: Array<Partial<NodeRecentTask>>;
    certificateReferences: Array<Partial<CertificateReference>>;
    startTaskInfo: Partial<StartTaskInfo>;
}

/**
 * Class for displaying Batch node information.
 */
@Model()
export class Node extends Record<NodeAttributes> {
    @Prop() public id: string;
    @Prop() public url: string;
    @Prop() public state: NodeState;
    @Prop() public schedulingState: string;
    @Prop() public stateTransitionTime: Date;
    @Prop() public lastBootTime: Date;
    @Prop() public allocationTime: Date;
    @Prop() public ipAddress: string;
    @Prop() public affinityId: string;
    @Prop() public vmSize: string;
    @Prop() public totalTasksRun: number = 0;
    @Prop() public totalTasksSucceeded: number = 0;
    @Prop() public runningTasksCount: number = 0;
    @Prop() public isDedicated: boolean;
    @Prop() public startTaskInfo: StartTaskInfo;

    @ListProp(NodeRecentTask) public recentTasks: List<NodeRecentTask> = List([]);
    @ListProp(CertificateReference) public certificateReferences: List<CertificateReference> = List([]);
}

export type NodeState = "creating" | "starting" | "waitingforstarttask" | "starttaskfailed" |
    "idle" | "offline" | "leavingpool" | "rebooting" | "reimaging" | "running" | "unknown" | "unusable" |
    "preempted";

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
    preempted: "preempted" as NodeState,
};
