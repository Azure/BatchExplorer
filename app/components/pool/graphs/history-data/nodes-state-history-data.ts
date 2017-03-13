import { List } from "immutable";

import { HistoryDataBase } from "./history-data-base";

import { Node } from "app/models";

export class NodesStateHistoryData extends HistoryDataBase {
    public states: Set<string>;

    constructor(states: string[]) {
        super();
        this.states = new Set(states);
    }

    public update(nodes: List<Node>) {
        const time = new Date();
        if (!this.hasTimePassed(time)) {
            return;
        }
        const count = nodes.filter(x => this.states.has(x.state)).size;
        this.history = this.history.concat([{
            time: time,
            y: count,
        }]);
        this.cleanup();
    }
}
