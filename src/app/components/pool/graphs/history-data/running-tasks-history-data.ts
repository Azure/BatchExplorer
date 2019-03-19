import { Node } from "app/models";
import { List } from "immutable";
import { HistoryDataBase } from "./history-data-base";

export class RunningTasksHistoryData extends HistoryDataBase {
    public update(nodes: List<Node>) {
        const runningTask = nodes.map(x => x.runningTasksCount).reduce((a, b) => a + b, 0);
        this.addPoint(runningTask);
        this.cleanup();
    }
}
