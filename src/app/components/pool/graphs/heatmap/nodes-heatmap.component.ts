import {
    AfterViewInit, ChangeDetectionStrategy, Component, ElementRef,
    HostBinding, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { ContextMenuItem, ContextMenuSeparator, ContextMenuService } from "@batch-flask/ui/context-menu";
import { log } from "@batch-flask/utils";
import { NodeCommands } from "app/components/node/action";
import { Node, NodeState, Pool } from "app/models";
import { ComponentUtils } from "app/utils";
import * as d3 from "d3";
import * as elementResizeDetectorMaker from "element-resize-detector";
import { List } from "immutable";
import { BehaviorSubject } from "rxjs";
import { HeatmapColor } from "./heatmap-color";
import { StateTree } from "./state-tree";

import "./nodes-heatmap.scss";
import { node } from "test/fixture";

interface HeatmapTile {
    index: number;
    node: Node;
}

const idleColor = "#edeef2";
const runningColor = "#388e3c";

const stateTree: StateTree = [
    { state: NodeState.idle, color: idleColor },
    // { state: NodeState.running, color: runningColor },
    { state: NodeState.running25, color: "#99D69C"},
    { state: NodeState.running50, color: "#6DC572"},
    { state: NodeState.running75, color: "#46AF4B"},
    { state: NodeState.running, color: runningColor},
    // {
    //     category: "running",
    //     label: "Task slot states",
    //     color: runningColor,
    //     states: [
    //         // TODO: change colors to be more accessible
    //         // The server won't return these states (running25, 50, and 75)
    //         // This is only for populating the heatmap for the task slot gradient
    //         { state: NodeState.running25, color: "#99D69C"},
    //         { state: NodeState.running50, color: "#6DC572"},
    //         { state: NodeState.running75, color: "#46AF4B"},
    //         { state: NodeState.running, color: runningColor},
    //     ],
    // },
    { state: NodeState.waitingForStartTask, color: "#be93d9" },
    { state: NodeState.offline, color: "#305796" },
    { state: NodeState.preempted, color: "#606060" },
    {
        category: "transition",
        label: "Transition states",
        color: "#ffcc5c",
        states: [
            { state: NodeState.creating, color: "#dbf659" },
            { state: NodeState.starting, color: "#fffe5c" },
            { state: NodeState.rebooting, color: "#ffcc5c" },
            { state: NodeState.reimaging, color: "#ffc95c" },
            { state: NodeState.leavingPool, color: "#ff755c" },
        ],
    }, {
        category: "error",
        label: "Error states",
        color: "#aa3939",
        states: [
            { state: NodeState.startTaskFailed, color: "#aa3939" },
            { state: NodeState.unusable, color: "#f95619" },
            { state: NodeState.unknown, color: "#f98819" },
        ],
    },
];

const maxNodes = 2500;
const maxTileSize = 100;

@Component({
    selector: "bl-nodes-heatmap",
    templateUrl: "nodes-heatmap.html",
    viewProviders: [
        { provide: "StateTree", useValue: stateTree },
    ],
    providers: [NodeCommands],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodesHeatmapComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input() public pool: Pool;

    @Input() public showLegend: boolean = true;

    @Input() public showRunningTasks: boolean = true;

    @Input() @HostBinding("class.interactive")
    public interactive: boolean = true;

    @Input() public limitNode: number = null;

    @Input() public nodes: List<Node>;

    @ViewChild("heatmap", { static: false }) public heatmapEl: ElementRef;

    @ViewChild("svg", { static: false }) public svgEl: ElementRef;

    public colors: HeatmapColor;
    public selectedNodeId = new BehaviorSubject<string>(null);
    public selectedNode = new BehaviorSubject<Node>(null);
    public highlightedState: string;

    public dimensions = {
        tileSize: 0,
        rows: 0,
        columns: 0,
    };

    private _erd: any;
    private _svg: d3.Selection<any, any, any, any>;
    private _width: number = 0;
    private _height: number = 0;
    private _nodes: List<Node>;
    private _nodeMap: { [id: string]: Node } = {};

    constructor(
        private commands: NodeCommands,
        private contextMenuService: ContextMenuService,
        private router: Router,
    ) {
        this.colors = new HeatmapColor(stateTree);
        this.selectedNodeId.subscribe(() => {
            this._updateSelectedNode();
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.pool) {
            if (ComponentUtils.recordChangedId(changes.pool)) {
                this.commands.params = { poolId: this.pool && this.pool.id };
                this.selectedNodeId.next(null);
                if (this._svg) {
                    this._svg.selectAll("g.node-group").remove();
                }
            }
        }

        if (changes.nodes) {
            if (this.nodes.size > maxNodes) {
                log.warn(`Only supporting up to ${maxNodes} nodes for now!`);
            }
            this._nodes = List<Node>(this.nodes.slice(0, this.limitNode || maxNodes));
            this._buildNodeMap();
            this._processNewData();
        }
    }

    public ngAfterViewInit() {
        this._erd = elementResizeDetectorMaker({
            strategy: "scroll",
        });

        this._erd.listenTo(this.heatmapEl.nativeElement, () => {
            this.containerSizeChanged();
        });

        this._svg = d3.select(this.svgEl.nativeElement)
            .attr("width", this._width)
            .attr("height", this._height);

        const defs = this._svg.append("defs");
        const pattern = defs.append("pattern")
            .attr("id", "low-pri-stripes")
            .attr("width", "10")
            .attr("height", "10")
            .attr("patternUnits", "userSpaceOnUse")
            .attr("patternTransform", "rotate(45 50 50)");

        pattern.append("line")
            .attr("stroke", "#fff")
            .attr("stroke-width", "2px")
            .attr("y2", "10");

        this._processNewData();
    }

    public ngOnDestroy() {
        this._erd.uninstall(this.heatmapEl.nativeElement);
    }

    public containerSizeChanged() {
        this._width = this.heatmapEl.nativeElement.offsetWidth;
        this._height = this.heatmapEl.nativeElement.offsetHeight;
        this._svg.attr("width", this._width).attr("height", this._height);
        this.redraw();
    }

    public selectState(state: string) {
        this.highlightedState = state;
        this.colors.updateColors(this.highlightedState);
        this.redraw();
    }

    public redraw() {
        this._computeDimensions();
        const tiles = this._nodes.map((node, index) => ({ node, index }));
        const groups = this._svg.selectAll("g.node-group").data(tiles.toJS());
        groups.exit().remove();
        this._updateSvg(groups);
    }

    private _processNewData() {
        if (!this._svg) {
            return;
        }
        this.redraw();
    }

    private _updateSvg(groups: any) {
        const spaceInBetweenNode = Math.ceil(this.dimensions.tileSize / 20);
        const z = Math.max(this.dimensions.tileSize - spaceInBetweenNode, 0);
        const nodeEnter = groups.enter().append("g")
            .attr("class", "node-group")
            .on("click", (tile) => {
                if (!this.interactive) {
                    return;
                }
                this.selectedNodeId.next(tile.node.id);
                this._updateSvg(this._svg.selectAll("g.node-group"));
            }).on("dblclick", (tile) => {
                if (!this.interactive) {
                    return;
                }
                this._gotoNode(tile.node);
            }).on("contextmenu", (tile) => {
                if (!this.interactive) {
                    return;
                }
                this._showContextMenu(tile.node);
            });

        nodeEnter.merge(groups)
            .attr("transform", (x) => this._translate(x as any))
            .attr("width", z)
            .attr("height", z);

        const backgroundGroup = nodeEnter.append("g").classed("bg", true).merge(groups.select("g.bg"));
        // tslint:disable-next-line: max-line-length
        const runningTaskSlotsGroup = nodeEnter.append("g").classed("taskslots", true).merge(groups.select("g.taskslots"));
        const lowPriOverlayGroup = nodeEnter.append("g").classed("lowpri", true).merge(groups.select("g.lowpri"));
        const title = nodeEnter.append("title").merge(groups.select("title"));

        this._displayNodeBackground(backgroundGroup, z);
        this._displayRunningTaskSlots(runningTaskSlotsGroup, z);
        this._displayLowPriOverlay(lowPriOverlayGroup, z);
        this._displayTileTooltip(title);
    }

    private _displayNodeBackground(backgroundGroup, z) {
        const nodeBackground = backgroundGroup.selectAll("rect").data((d) => [d]);
        nodeBackground.enter().append("rect").merge(nodeBackground)
            .attr("width", z)
            .attr("height", z)
            .style("fill", (tile: any) => {
                return this._tileBgColor(tile.node);
            })
            .style("stroke-width", (tile: any) => {
                return tile.node.id === this.selectedNodeId.value ? "2px" : "0";
            });

        nodeBackground.exit().remove();
    }

    private _displayLowPriOverlay(lowPriGroup, z) {
        const nodeBackground = lowPriGroup.selectAll("rect").data((d) => [d]);
        nodeBackground.enter().append("rect").merge(nodeBackground)
            .attr("width", z)
            .attr("height", z)
            .style("fill", (tile: any) => {
                if (tile.node.isDedicated) {
                    return "transparent";
                } else {
                    return "url(#low-pri-stripes)";
                }
            })
            .style("stroke-width", (tile: any) => {
                return tile.node.id === this.selectedNodeId.value ? "2px" : "0";
            });

        nodeBackground.exit().remove();
    }

    /**
     * Get the color of the tile given the node it is assigned
     * @param node Node for the given tile
     *
     * It will use the color of the state of the node unless the node is running.
     * In the case the node is running it will use the idle background color as the tasks will be displayed above
     * unless tasks are not loaded yet and so it will use the running color.
     *
     * If the node is low priority it will use a dashed pattern.
     * If the node is dedicated it will fill the bg with the color.
     */
    private _tileBgColor(node: Node) {
        const showTaskOverlay = node.state === NodeState.running;
        const color = showTaskOverlay ? idleColor : this.colors.get(node.state);
        return d3.color(color) as any;
    }

    private _displayRunningTaskSlots(taskSlotGroup, z) {
        if (z === 0) { // When switching between the graphs there is a moment where the width/height is 0
            return;
        }

        const runningTaskSlotRects = taskSlotGroup.selectAll("rect").data((d) => {
            const node: Node = d.node;
            if (node.state !== NodeState.running) {
                return [];
            };
            const percentageUsed = this._getTaskSlotsUsagePercent(node);
            console.log("IMMA PERCENT: ", percentageUsed);
            if (percentageUsed <= 25) {
                return [this.colors.get(NodeState.running25)];
            } else if (percentageUsed <= 50) {
                console.log("heyoooooooo");
                return [this.colors.get(NodeState.running50)];
            } else if (percentageUsed <= 75) {
                return [this.colors.get(NodeState.running75)];
            } else {
                return [this.colors.get(NodeState.running)];
            }
        });


        runningTaskSlotRects.enter().append("rect").merge(runningTaskSlotRects)
            .attr("width", z)
            .attr("height", z)
            .style("fill", (data) => {
                console.log(data);
                return data;
            });
        runningTaskSlotRects.exit().remove();
    }



    /**
     * Display either how many tasks are running on a given node or an error code if the node errors.
     * @param Selection object
     *
     * If the nodes are in an error state, it will return show a tooltip with the error state and the node id.
     * If the nodes are not in an error state, it will show the number of tasks running on the node and the
     * node id.
     */
    private _displayTileTooltip(titleNode) {
        titleNode.text((tile) => {
            const taskCount = tile.node.runningTasksCount;
            const taskSlotsCount = tile.node.runningTaskSlotsCount;
            if (tile.node.state === NodeState.unusable) {
                return `Error: Unusable state on node (${tile.node.id})`;
            } else if (tile.node.state === NodeState.startTaskFailed) {
                return `Error: Start task failed on node (${tile.node.id})`;
            } else if (tile.node.state === NodeState.unknown) {
                return `Error: Unknown state on node (${tile.node.id})`;
            } else {
                return `${taskCount} tasks (${taskSlotsCount}/${this.pool.taskSlotsPerNode} slots) running on node (${tile.node.id})`;
            }
       });
    }

    private _getTaskSlotsUsagePercent(node: Node): number {
        const taskSlotsPerNode = this.pool.taskSlotsPerNode;
        const taskSlotsCount = node.runningTaskSlotsCount;
        const taskSlotPercentUsed = Math.floor((taskSlotsCount / taskSlotsPerNode) * 100);
        // console.log("PERCENT ", taskSlotPercentUsed);
        return taskSlotPercentUsed;
    }

    private _getTaskSlotsHeight(tileSize: number, node: Node) {
        const taskSlotsPerNode = this.pool.taskSlotsPerNode; // total amount of task slots on that node
        const taskSlotsCount = node.runningTaskSlotsCount; // number of running task slots on that node
        const taskSlotsHeight = Math.floor((taskSlotsCount / taskSlotsPerNode) * tileSize); // running task slots / total task slots percetage multipled by size of tile
        const remaining = tileSize % taskSlotsPerNode; // whatever is still left over
        let height;
        const combine = taskSlotsHeight < 2; // the height is 2 or more then it doesn't need to be combined ?
        if (combine) {
            height = Math.floor(tileSize / taskSlotsPerNode * taskSlotsCount);
        } else {
            height = taskSlotsHeight - 1;
        }
        return { taskSlotsHeight: Math.max(1, height), combine, remaining };
    }

    /**
     * Compute the dimension of the heatmap.
     *  - rows
     *  - columns
     *  - tile size
     */
    private _computeDimensions() {
        const area = this._height * this._width;
        const areaPerTile = area / this._nodes.size;
        const estimatedSize = Math.floor(Math.sqrt(areaPerTile));
        const rows = this._height / estimatedSize;
        const columns = this._width / estimatedSize;
        this._computeBestDimension(rows, columns);

        const dimensions = this.dimensions;
        if (dimensions.rows === 0 || dimensions.columns === 0) {
            dimensions.tileSize = 0;
        } else {
            dimensions.tileSize = Math.min(
                Math.floor(this._height / dimensions.rows),
                Math.floor(this._width / dimensions.columns),
                maxTileSize,
            );
        }
    }

    /**
     * Compute the best rows and columns from the estimated values
     * Used by compute dimensions
     */
    private _computeBestDimension(estimatedRows: number, estimatedColumns: number) {
        const floorRows = Math.floor(estimatedRows);
        const floorColumns = Math.floor(estimatedColumns);
        const ceilRows = Math.ceil(estimatedRows);
        const ceilColumns = Math.ceil(estimatedColumns);
        const options = [
            { x: ceilColumns, y: floorRows },
            { x: floorColumns, y: ceilRows },
            { x: ceilColumns, y: ceilRows },
        ].map((option: any) => {
            option.total = option.x * option.y;
            return option;
        }).filter((option) => {
            return option.total >= this._nodes.size;
        }).sort((a, b) => {
            return a.total - b.total;
        });
        if (options.length === 0) {
            this.dimensions.rows = 0;
            this.dimensions.columns = 0;
        } else {
            this.dimensions.rows = options[0].y;
            this.dimensions.columns = options[0].x;
        }
    }

    /**
     * Compute the position of the given tile
     */
    private _translate(tile: HeatmapTile) {
        const z = this.dimensions.tileSize;
        if (z === 0) {
            return `translate(0,0)`;
        }
        const i = tile.index;
        const c = this.dimensions.columns;
        const x = ((i % c) * z + 1);
        const y = Math.floor(i / c) * z + 1;
        return `translate(${x}, ${y})`;
    }

    private _buildNodeMap() {
        const map: { [id: string]: Node } = {};
        this._nodes.forEach((node) => {
            map[node.id] = node;
        });

        this._nodeMap = map;
        this._updateSelectedNode();
    }

    private _updateSelectedNode() {
        this.selectedNode.next(this._nodeMap[this.selectedNodeId.getValue()]);
    }

    private _showContextMenu(node: Node) {
        this.contextMenuService.openMenu(this._buildContextMenu(node));
    }

    private _buildContextMenu(node: Node) {
        const menu = this.commands.contextMenuFromEntity(node, { skipConfirm: true });
        menu.prepend(new ContextMenuSeparator());
        menu.prepend(new ContextMenuItem({ label: "Monitor", click: () => this._monitor(node) }));
        menu.prepend(new ContextMenuItem({ label: "Go to", click: () => this._gotoNode(node) }));

        if (node.state === NodeState.startTaskFailed) {
            menu.addItem(new ContextMenuItem({ label: "View start task output", click: () => this._gotoNode(node) }));
        }
        return menu;
    }

    private _gotoNode(node: Node) {
        this.router.navigate(["/pools", this.pool.id, "nodes", node.id]);
    }

    private _monitor(node: Node) {
        this.router.navigate(["/pools", this.pool.id, "nodes", node.id], {
            queryParams: {
                tab: "monitoring",
            },
        });
    }
}
