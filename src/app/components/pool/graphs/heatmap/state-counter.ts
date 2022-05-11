import { ObjectUtils, log } from "@batch-flask/utils";
import { Node, NodeState, Pool } from "app/models";
import { NodeUtils } from "app/utils";
import { List } from "immutable";
import { BehaviorSubject } from "rxjs";

interface CountMap { [key: string]: number; }
interface CounObsMap { [key: string]: BehaviorSubject<number>; }

export class StateCounter {
    private _data: CounObsMap = {};

    constructor() {
        for (const state of ObjectUtils.values(NodeState)) {
            this._data[state] = new BehaviorSubject(0);
        }
    }

    public get(state: NodeState) {
        return this._data[state];
    }

    public updateCount(nodes: List<Node>, pool: Pool) {
        const counts: CountMap = {};
        for (const state of ObjectUtils.values(NodeState)) {
            counts[state] = 0;
        }
        nodes.forEach((node) => {
            if (node.state in counts) {

                // TODO: comment why we have this
                if (node.state === NodeState.running) {
                   const percentTaskSlotUsage = NodeUtils.getTaskSlotsUsagePercent(node, pool);
                   if (percentTaskSlotUsage <= 25) {
                        counts[NodeState.running25]++;
                    } else if (percentTaskSlotUsage <= 50) {
                        counts[NodeState.running50]++;
                    } else if (percentTaskSlotUsage <= 75) {
                        counts[NodeState.running75]++;
                    } else if (percentTaskSlotUsage <= 99) {
                        counts[NodeState.running99]++;
                    } else {
                        counts[NodeState.running100]++;
                    }
                }
                counts[node.state]++;
            } else {
                log.error(`Node '${node.id}' has an unknown state '${node.state}'`);
            }
        });
        for (const state of ObjectUtils.values(NodeState)) {
            (this._data[state] as BehaviorSubject<number>).next(counts[state]);
        }
    }

    public getCountforCategory(category: string): number {
        const subStates = NodeUtils.getSubStatesforCategory(category);
        const totalCount = subStates.reduce(
            (result, curState) => result + this.get(curState).value, 0);
        return totalCount;
    }


}
