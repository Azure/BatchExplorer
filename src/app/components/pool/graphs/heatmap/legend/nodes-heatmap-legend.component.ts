import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";
import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";
import { Node, Pool } from "app/models";
import { NodeService } from "app/services";
import { List } from "immutable";
import { expand } from "rxjs/operators";
import { StateCounter } from "../state-counter";
import { CategoryNode, StateNode, StateTree } from "../state-tree";

import "./nodes-heatmap-legend.scss";

@Component({
    selector: "bl-nodes-heatmap-legend",
    templateUrl: "nodes-heatmap-legend.html",
})
export class NodesHeatmapLegendComponent {
    @Input()
    public pool: Pool;

    @Input()
    public set nodes(nodes: List<Node>) {
        this.stateCounter.updateCount(nodes);
    }

    @Input()
    public colors: any;

    public expandedCategory: string;
    public stateCounter: StateCounter;
    public highlightedState: string;

    @Output()
    public selectedStateChange = new EventEmitter();

    constructor(
        @Inject("StateTree") public stateTree: StateTree,
        private nodeService: NodeService,
        private contextMenuService: ContextMenuService) {
        this.stateCounter = new StateCounter();
    }

    public selectState(state: string, categoryParent: string = "") {
        if (state === this.expandedCategory) {
            this.expandedCategory = "";
            this.highlightedState = "";
        } else if (state === this.highlightedState) {
            this.highlightedState = "";
        } else {
            this.expandedCategory = categoryParent;
            this.highlightedState = state;
        }
        this.selectedStateChange.emit(this.highlightedState);
    }

    public openContextMenu(item: StateNode | CategoryNode) {
        const state = (item as StateNode).state;
        const name = state ? `${state} states` : (item as CategoryNode).label;
        this.contextMenuService.openMenu(new ContextMenu([
            new ContextMenuItem(`Reboot all ${name}`, () => this.rebootAll(item)),
            new ContextMenuItem({
                label: `Reimage all ${name}`,
                click: () => this.reimageAll(item),
                enabled: Boolean(this.pool.cloudServiceConfiguration),
            }),
        ]));
    }

    public rebootAll(item: StateNode | CategoryNode) {
        if ((item as StateNode).state) {
            this.nodeService.rebootAll(this.pool.id, [(item as StateNode).state]);
        } else {
            const category = item as CategoryNode;
            this.nodeService.rebootAll(this.pool.id, category.states.map(x => x.state));
        }
    }

    public reimageAll(item: StateNode | CategoryNode) {
        if ((item as StateNode).state) {
            this.nodeService.reimageAll(this.pool.id, [(item as StateNode).state]);
        } else {
            const category = item as CategoryNode;
            this.nodeService.reimageAll(this.pool.id, category.states.map(x => x.state));
        }
    }

    public trackState(index, state: StateNode | CategoryNode) {
        return (state as StateNode).state || (state as CategoryNode).category;
    }
}
