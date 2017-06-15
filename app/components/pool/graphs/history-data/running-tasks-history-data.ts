import { List } from "immutable";

import { Node } from "app/models";
import { HistoryDataBase } from "./history-data-base";

export class RunningTasksHistoryData extends HistoryDataBase {
    public update(nodes: List<Node>) {
        const time = new Date();
        if (!this.hasTimePassed(time)) {
            return;
        }
        const runningTask = nodes.map(x => x.runningTasksCount).reduce((a, b) => a + b, 0);
        this.history = this.history.concat([{
            time: time,
            y: runningTask,
        }]);
        this.cleanup();
    }
}
