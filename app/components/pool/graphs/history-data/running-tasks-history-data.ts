import { List } from "immutable";

import { Node } from "app/models";
import { HistoryDataBase } from "./history-data-base";

export class RunningTasksHistoryData extends HistoryDataBase {
    private _latest = 2;

    public update(nodes: List<Node>) {
        const time = new Date();
        if (!this.hasTimePassed(time)) {
            return;
        }
        // const runningTask = this.nodes.map(x => x.runningTasks.size).reduce((a, b) => a + b, 0);
        const diff = Math.floor(Math.random() * 3) - 1;
        const runningTask = Math.min(Math.max(this._latest + diff, 0), 10);
        this._latest = runningTask;
        this.history = this.history.concat([{
            x: time,
            y: runningTask,
        }]);
        this.cleanup();
    }
}
