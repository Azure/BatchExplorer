import {
    AfterViewInit, ChangeDetectionStrategy, Component, ElementRef,
    HostBinding, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild,
} from "@angular/core";
import * as d3 from "d3";
import * as elementResizeDetectorMaker from "element-resize-detector";
import { List } from "immutable";
import { BehaviorSubject } from "rxjs";

import { Job, Node, NodeState, Pool, Task } from "app/models";
import { Constants, log } from "app/utils";
import { HeatmapColor } from "./heatmap-color";
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
    public set nodes(nodes: List<Node>) {
        if (nodes.size > maxNodes) {
            log.warn(`Only supporting up to ${maxNodes} nodes for now!`);
        }
        this._nodes = List<Node>(nodes.slice(0, this.limitNode || maxNodes));
        this._buildNodeMap();
        this._processNewNodes();
    }
    public get nodes() { return this._nodes; }

    @Input()
    public jobs: List<Job> = List([]);

    @Input()
    public tasks: List<Task> = List([]);

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
    private _nodeMap: { [id: string]: Node } = {};
    private _nodes: List<Node>;
    private _taskPerNodes: StringMap<number> = {};

    constructor(private elementRef: ElementRef) {
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

        if (changes.tasks) {
            this._processNewTasks(this.tasks);
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

        this._processNewNodes();
    }

    public ngOnDestroy() {
        this._erd.uninstall(this.elementRef.nativeElement);
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

    private _processNewNodes() {
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
                    return "";
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
        const hasTasksData = this.pool.maxTasksPerNode <= Constants.nodeRecentTaskLimit || this.tasks.size > 0;
        const showTaskOverlay = node.state === NodeState.running && hasTasksData;
        const color = showTaskOverlay ? idleColor : this.colors.get(node.state);
        return d3.color(color) as any;
    }

    private _displayRunningTasks(taskGroup, z) {
        const maxTaskPerNode = this.pool.maxTasksPerNode;
        const taskWidth = Math.floor(z / maxTaskPerNode);

        const runningTaskRects = taskGroup.selectAll("rect")
            .data((d) => {
                const node: Node = d.node;
                if (node.state !== NodeState.running || !node.recentTasks) {
                    return [];
                }
                if (maxTaskPerNode <= Constants.nodeRecentTaskLimit) {
                    return node.runningTasks.map((task, index) => ({ node, index })).toJS();
                } else {
                    const count = this._taskPerNodes[node.id] || 0;
                    const array = new Array(count).fill(0).map((task, index) => ({ node, index }));
                    return array;
                }
            });

        runningTaskRects.enter().append("rect")
            .attr("transform", (data) => {
                const index = data.index;
                const x = z - (index + 1) * taskWidth;
                return `translate(0,${x})`;
            })
            .attr("width", z)
            .attr("height", taskWidth - 1)
            .style("fill", runningColor);

        runningTaskRects.exit().remove();
    }

    private _displayTileTooltip(titleNode) {
        titleNode.text((tile) => {
            if (this.tasks.size === 0) {
                return "Loading running tasks.";
            } else {
                const count = this._taskPerNodes[tile.node.id] || 0;
                return `${count} tasks running on this node`;
            }
        });
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

    private _processNewTasks(tasks: List<Task>) {
        let taskPerNode = this._taskPerNodes = {};
        if (!tasks) {
            return;
        }
        tasks.forEach((task) => {
            const nodeId = task.nodeInfo.nodeId;
            if (!(nodeId in taskPerNode)) {
                taskPerNode[nodeId] = 1;
            } else {
                taskPerNode[nodeId]++;
            }
        });
    }
}
