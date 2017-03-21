import { List } from "immutable";
import { BehaviorSubject } from "rxjs";

import { Node, NodeState } from "app/models";
import { ObjectUtils, log } from "app/utils";

type CountMap = { [key: string]: number };
type CounObsMap = { [key: string]: BehaviorSubject<number> };

export class StateCounter {
    private _data: CounObsMap = {};

    constructor() {
        for (let state of ObjectUtils.values(NodeState)) {
            this._data[state] = new BehaviorSubject(0);
        }
    }

    public get(state: NodeState) {
        return this._data[state];
    }

    public updateCount(nodes: List<Node>) {
        let counts: CountMap = {};
        for (let state of ObjectUtils.values(NodeState)) {
            counts[state] = 0;
        }
        nodes.forEach((node) => {
            if (node.state in counts) {
                counts[node.state]++;
            } else {
                log.error(`Node '${node.id}' has an unknown state '${node.state}'`);
            }
        });
        for (let state of ObjectUtils.values(NodeState)) {
            (this._data[state] as BehaviorSubject<number>).next(counts[state]);
        }
    }
}
