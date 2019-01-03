import { ObjectUtils, log } from "@batch-flask/utils";
import { Node, NodeState } from "app/models";
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

    public updateCount(nodes: List<Node>) {
        const counts: CountMap = {};
        for (const state of ObjectUtils.values(NodeState)) {
            counts[state] = 0;
        }
        nodes.forEach((node) => {
            if (node.state in counts) {
                counts[node.state]++;
            } else {
                log.error(`Node '${node.id}' has an unknown state '${node.state}'`);
            }
        });
        for (const state of ObjectUtils.values(NodeState)) {
            (this._data[state] as BehaviorSubject<number>).next(counts[state]);
        }
    }
}
