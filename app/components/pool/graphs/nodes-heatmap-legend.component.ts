import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";
import { List } from "immutable";

import { Node } from "app/models";
import { StateCounter } from "./state-counter";
import { StateTree } from "./state-tree";

@Component({
    selector: "bl-nodes-heatmap-legend",
    templateUrl: "nodes-heatmap-legend.html",
})
export class NodesHeatmapLegendComponent {
    @Input()
    public set nodes(nodes: List<Node>) {
        this.stateCounter.updateCount(nodes);
    }

    @Input()
    public colors: any;

    public stateCounter: StateCounter;
    public highlightedState: string = null;

    @Output()
    public selectedStateChange = new EventEmitter();

    constructor( @Inject("StateTree") public stateTree: StateTree) {
        this.stateCounter = new StateCounter();
    }

    public selectState(state: string) {
        if (state === this.highlightedState) {
            this.highlightedState = null;
        } else {
            this.highlightedState = state;
        }
        this.selectedStateChange.emit(this.highlightedState);
    }
}
