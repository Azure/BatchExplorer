import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";
import { List } from "immutable";

import { ContextMenu, ContextMenuItem, ContextMenuService } from "app/components/base/context-menu";
import { Node } from "app/models";
import { NodeService } from "app/services";
import { StateCounter } from "./state-counter";
import { CategoryNode, StateNode, StateTree } from "./state-tree";

import "./nodes-heatmap-legend.scss";

@Component({
    selector: "bl-nodes-heatmap-legend",
    templateUrl: "nodes-heatmap-legend.html",
})
export class NodesHeatmapLegendComponent {
    @Input()
    public poolId: string;

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

    constructor(
        @Inject("StateTree") public stateTree: StateTree,
        private nodeService: NodeService,
        private contextMenuService: ContextMenuService) {
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

    public openContextMenu(item: StateNode | CategoryNode) {
        const state = (item as StateNode).state;
        const name = state ? `${state} states` : (item as CategoryNode).label;
        this.contextMenuService.openMenu(new ContextMenu([
            new ContextMenuItem(`Reboot all ${name}`, () => this.rebootAll(item)),
            new ContextMenuItem(`Reimage all ${name}`, () => this.reimageAll(item)),
        ]));
    }

    public rebootAll(item: StateNode | CategoryNode) {
        if ((item as StateNode).state) {
            this.nodeService.rebootAll(this.poolId, [(item as StateNode).state]);
        } else {
            const category = item as CategoryNode;
            this.nodeService.rebootAll(this.poolId, category.states.map(x => x.state));
        }
    }

    public reimageAll(item: StateNode | CategoryNode) {
        if ((item as StateNode).state) {
            this.nodeService.reimageAll(this.poolId, [(item as StateNode).state]);
        } else {
            const category = item as CategoryNode;
            this.nodeService.reimageAll(this.poolId, category.states.map(x => x.state));
        }
    }
}
