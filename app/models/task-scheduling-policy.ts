/**
 * Contains information about the task scheduling policy of a pool
 */
export class TaskSchedulingPolicy {
    public nodeFillType: NodeFillType;
}

export enum NodeFillType {
    pack = "pack",
    spread = "spread",
}
