import {
    AfterViewInit, ChangeDetectionStrategy, Component, ElementRef,
    HostBinding, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import * as d3 from "d3";
import * as elementResizeDetectorMaker from "element-resize-detector";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { ContextMenu, ContextMenuItem, ContextMenuService } from "app/components/base/context-menu";
import { NotificationService } from "app/components/base/notifications";
import { SidebarManager } from "app/components/base/sidebar";
import { NodeConnectComponent } from "app/components/node/connect";
import { Job, Node, NodeState, Pool, ServerError } from "app/models";
import { NodeService } from "app/services";
import { log } from "app/utils";
import { HeatmapColor } from "./heatmap-color";
import "./nodes-heatmap.scss";
import { StateTree } from "./state-tree";

interface HeatmapTile {
    index: number;
    node: Node;
}

const idleColor = "#edeef2";
const runningColor = "#388e3c";

const stateTree: StateTree = [
    { state: NodeState.idle, color: idleColor },
    { state: NodeState.running, color: runningColor },
    { state: NodeState.waitingForStartTask, color: "#be93d9" },
    { state: NodeState.offline, color: "#5b5b5b" },
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

const maxNodes = 1000;
const maxTileSize = 300;

@Component({
    selector: "bl-nodes-heatmap",
    templateUrl: "nodes-heatmap.html",
    viewProviders: [
        { provide: "StateTree", useValue: stateTree },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodesHeatmapComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input()
    public pool: Pool;

    @Input()
    public showLegend: boolean = true;

    @Input()
    public showRunningTasks: boolean = true;

    @Input()
    @HostBinding("class.interactive")
    public interactive: boolean = true;

    @Input()
    public limitNode: number = null;

    @ViewChild("heatmap")
    public heatmapEl: ElementRef;

    @ViewChild("svg")
    public svgEl: ElementRef;

    @Input()
    public nodes: List<Node>;

    @Input()
    public jobs: List<Job> = List([]);

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
        private contextMenuService: ContextMenuService,
        private nodeService: NodeService,
        private sidebarManager: SidebarManager,
        private notificationService: NotificationService,
        private router: Router,
    ) {
        this.colors = new HeatmapColor(stateTree);
        this.selectedNodeId.subscribe(() => {
            this._updateSelectedNode();
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.pool) {
            const prev = changes.pool.previousValue;
            const cur = changes.pool.currentValue;
            if (prev && cur && prev.id === cur.id) {
                return;
            }
            this.selectedNodeId.next(null);
            if (this._svg) {
                this._svg.selectAll("g.node-group").remove();
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

        this._erd.listenTo(this.heatmapEl.nativeElement, (element) => {
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
        const z = Math.max(this.dimensions.tileSize - 6, 0);
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
        const runningTaskGroup = nodeEnter.append("g").classed("tasks", true).merge(groups.select("g.tasks"));
        const lowPriOverlayGroup = nodeEnter.append("g").classed("lowpri", true).merge(groups.select("g.lowpri"));
        const title = nodeEnter.append("title").merge(groups.select("title"));

        this._displayNodeBackground(backgroundGroup, z);
        this._displayRunningTasks(runningTaskGroup, z);
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

    private _displayRunningTasks(taskGroup, z) {
        if (z === 0) { // When switching between the graphs there is a moment where the width/height is 0
            return;
        }

        const runningTaskRects = taskGroup.selectAll("rect").data((d) => {
            const node: Node = d.node;
            return this._computeRunningTaskTilesDimensions(node, z);
        });

        runningTaskRects.enter().append("rect").merge(runningTaskRects)
            .attr("transform", (data) => {
                // const index = data.index;
                const x = z - data.position;
                return `translate(0,${x})`;
            })
            .attr("width", z)
            .attr("height", (data) => data.taskHeight)
            .style("fill", runningColor);

        runningTaskRects.exit().remove();
    }

    private _computeRunningTaskTilesDimensions(node: Node, tileSize: number) {
        if (node.state !== NodeState.running) {
            return [];
        }
        const { taskHeight, combine, remaining } = this._getTaskHeight(tileSize, node);
        if (combine) {
            return [{ node, index: 0, taskHeight, position: taskHeight }];
        }
        const count = node.runningTasksCount;
        let extra = remaining;
        let position = 0;
        const array = new Array(count).fill(0).map((task, index) => {
            let height = taskHeight;
            if (extra > 0) {
                extra--;
                height++;
            }
            position += height + 1;
            return { node, index, taskHeight: height, position };
        });
        return array;
    }

    private _displayTileTooltip(titleNode) {
        titleNode.text((tile) => {
            const count = tile.node.runningTasksCount;
            return `${count} tasks running on this node (${tile.node.id})`;
        });
    }

    private _getTaskHeight(tileSize: number, node: Node) {
        const maxTaskPerNode = 16;
        const taskHeight = Math.floor(tileSize / maxTaskPerNode);
        const remaining = tileSize % maxTaskPerNode;
        let height;
        const combine = taskHeight < 2;
        if (combine) {
            height = Math.floor(tileSize / maxTaskPerNode * node.runningTasksCount);
        } else {
            height = taskHeight - 1;
        }
        return { taskHeight: Math.max(1, height), combine, remaining };
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
        let estimatedSize = Math.floor(Math.sqrt(areaPerTile));
        let rows = this._height / estimatedSize;
        let columns = this._width / estimatedSize;
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
        const actions = [
            new ContextMenuItem({ label: "Go to", click: () => this._gotoNode(node) }),
            new ContextMenuItem({ label: "Connect", click: () => this._connectTo(node) }),
            new ContextMenuItem({ label: "Reboot", click: () => this._reboot(node) }),
            new ContextMenuItem({ label: "Reimage", click: () => this._reimage(node) }),
            new ContextMenuItem({ label: "Delete", click: () => this._delete(node) }),
        ];

        if (node.state === NodeState.startTaskFailed) {
            actions.push(new ContextMenuItem({ label: "View start task output", click: () => this._gotoNode(node) }));
        }
        return new ContextMenu(actions);
    }

    private _reboot(node: Node) {
        this._nodeAction(node, this.nodeService.reboot(this.pool.id, node.id)).cascade(() => {
            this.notificationService.success("Node rebooting!", `Node ${node.id} started rebooting`);
        });
    }

    private _reimage(node: Node) {
        this._nodeAction(node, this.nodeService.reimage(this.pool.id, node.id)).cascade(() => {
            this.notificationService.success("Node reimaging!", `Node ${node.id} started reimaging`);
        });
    }

    private _delete(node: Node) {
        this._nodeAction(node, this.nodeService.delete(this.pool.id, node.id)).cascade(() => {
            this.notificationService.success("Node deleting!", `Node ${node.id} is being removed from the pool.`);
        });
    }

    private _nodeAction(node: Node, action: Observable<any>): Observable<any> {
        action.subscribe({
            next: () => {
                this.nodeService.getOnce(this.pool.id, node.id);
            },
            error: (error: ServerError) => {
                this.notificationService.error(error.code, error.message);
            },
        });
        return action;
    }

    private _gotoNode(node: Node) {
        this.router.navigate(["/pools", this.pool.id, "nodes", node.id], {
            queryParams: {
                tab: "files",
            },
        });
    }

    private _connectTo(node: Node) {
        const ref = this.sidebarManager.open(`connect-node`, NodeConnectComponent, true);
        ref.component.node = node;
        ref.component.pool = this.pool;
    }
}
