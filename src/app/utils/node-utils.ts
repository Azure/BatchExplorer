import { Node, NodeState, Pool } from "app/models";

export class NodeUtils {

    public static getSubStatesforCategory(category: string): NodeState[] {
        if (category === "error") {
            return [NodeState.startTaskFailed, NodeState.unusable, NodeState.unknown];
        } else if (category === "transition") {
            return [NodeState.creating, NodeState.starting, NodeState.rebooting, NodeState.reimaging, NodeState.leavingPool];
        } else if (category === "running") {
            return [NodeState.running25, NodeState.running50, NodeState.running75, NodeState.running100];
        }
        return [];
    }

    public static getTaskSlotsUsagePercent(node: Node, pool: Pool): number {
        const taskSlotsPerNode = pool.taskSlotsPerNode;
        const taskSlotsCount = node.runningTaskSlotsCount;
        const taskSlotPercentUsed = Math.floor((taskSlotsCount / taskSlotsPerNode) * 100);
        return taskSlotPercentUsed;
    }

}
