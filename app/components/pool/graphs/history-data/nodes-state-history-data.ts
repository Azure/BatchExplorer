import { List, is } from "immutable";
import * as moment from "moment";

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
            x: time,
            y: count,
        }]);
        this.cleanup();
    }

    public cleanup() {
        const maxTime = moment().subtract(10, "minutes");
        while (true) {
            const data = this.history.first();
            const diff = moment(data.x).diff(maxTime);
            if (diff < 0) {
                this.history.shift();
            } else {
                break;
            }
        }
    }
}
