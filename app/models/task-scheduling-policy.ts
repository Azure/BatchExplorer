/**
 * Contains information about the task scheduling policy of a pool
 */
export class TaskSchedulingPolicy {
    public nodeFillType: NodeFillType;
}

export type NodeFillType = "pack" | "spread ";
export const NodeFillType = {
    pack: "pack" as NodeFillType,
    spread: "spread" as NodeFillType,
};
