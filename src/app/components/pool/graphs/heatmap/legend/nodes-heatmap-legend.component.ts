import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";
import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";
import { Node, Pool } from "app/models";
import { NodeService } from "app/services";
import { List } from "immutable";
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

    public selectCategory(category: string) {
        if (category === this.expandedCategory) {
            this.expandedCategory = "";
        } else {
            this.expandedCategory = category;
        }
        this.selectState(category);
    }

    // add for HTML in legend-item category
    // (click)="showSubItems(item.category)"

    // public showSubItems(state: string) {
    //     console.log("hi it went into the correct function");
    //     const subItems = document.getElementsByClassName('legend-subitem') as HTMLCollectionOf<HTMLElement>;
    //     console.log("PENGUIN", subItems);
    //     for (let i = 0; i < subItems.length; i++) {
    //         const displaySetting = subItems[i].style.display;
    //         if (displaySetting == "flex") {
    //             subItems[i].style.display = "none";
    //         } else {
    //             subItems[i].style.display = "flex";
    //         }
    //     }
    // }

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
