import { Node } from "app/models";
import { List } from "immutable";
import { HistoryDataBase } from "./history-data-base";

export class NodesStateHistoryData extends HistoryDataBase {
    public states: Set<string>;

    constructor(states: string[]) {
        super();
        this.states = new Set(states);
    }

    public update(nodes: List<Node>) {
        const count = nodes.filter(x => this.states.has(x.state)).size;
        this.addPoint(count);
        this.cleanup();
    }
}
