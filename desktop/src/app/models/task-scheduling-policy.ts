import { Model, Prop, Record } from "@batch-flask/core";

export interface TaskSchedulingPolicyAttributes {
    nodeFillType: NodeFillType;
}
/**
 * Contains information about the task scheduling policy of a pool
 */
@Model()
export class TaskSchedulingPolicy extends Record<TaskSchedulingPolicyAttributes> {
    @Prop() public nodeFillType: NodeFillType;
}

export enum NodeFillType {
    pack = "pack",
    spread = "spread",
}
