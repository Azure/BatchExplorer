import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from "@angular/core";
import * as d3 from "d3";
import * as elementResizeDetectorMaker from "element-resize-detector";
import { List } from "immutable";
import { BehaviorSubject } from "rxjs";

import { Node, NodeState } from "app/models";
import { log } from "app/utils";
import { HeatmapColor } from "./heatmap-color";
import { StateTree } from "./state-tree";

interface HeatmapTile {
    index: number;
    node: Node;
}

const stateTree: StateTree = [
    { state: NodeState.idle, color: "#6ba3cb" },
    { state: NodeState.running, color: "#388e3c" },
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
})
export class NodesHeatmapComponent implements AfterViewInit, OnChanges, OnDestroy {
    public colors: HeatmapColor;

    @Input()
    public poolId: string;

    @ViewChild("heatmap")
    public heatmapEl: ElementRef;

    @Input()
    public set nodes(nodes: List<Node>) {
        if (nodes.size > maxNodes) {
            log.warn(`Only supporting up to ${maxNodes} nodes for now!`);
        }
        this._nodes = List<Node>(nodes.slice(0, maxNodes));
        this._buildNodeMap();
        this._processNewNodes();
    }
    public get nodes() { return this._nodes; };
    public selectedNodeId = new BehaviorSubject<string>(null);
    public selectedNode = new BehaviorSubject<Node>(null);
    public highlightedState: string;

    public dimensions = {
        tileSize: 0,
        rows: 0,
        columns: 0,
    };

    private _nodes: List<Node>;

    private _erd: any;
    private _svg: d3.Selection<any, any, any, any>;
    private _width: number = 0;
    private _height: number = 0;
    private _nodeMap: { [id: string]: Node } = {};

    constructor(private elementRef: ElementRef) {
        this.colors = new HeatmapColor(stateTree);
        this.selectedNodeId.subscribe(() => {
            this._updateSelectedNode();
        });
    }

    public ngOnChanges(changes) {
        if (changes.poolId) {
            this.selectedNodeId.next(null);
        }
    }

    public ngAfterViewInit() {
        this._erd = elementResizeDetectorMaker({
            strategy: "scroll",
        });
        this._erd.listenTo(this.heatmapEl.nativeElement, (element) => {
            this.containerSizeChanged();
        });

        this._svg = d3.select(this.heatmapEl.nativeElement).append("svg")
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
        this._svg.attr("width", this._width)
            .attr("height", this._height);
        this.redraw();
    }

    public selectState(state: string) {
        this.highlightedState = state;
        this.redraw();
    }

    public redraw() {
        this.colors.updateColors(this.highlightedState);
        this._computeDimensions();
        const rects = this._svg.selectAll("rect");
        this._updateSvg(rects);
    }

    private _processNewNodes() {
        if (!this._svg) {
            return;
        }
        this._computeDimensions();

        const tiles = this._nodes.map((node, index) => ({ node, index }));
        const rects = this._svg.selectAll("rect").data(tiles.toJS());

        rects.exit().remove();
        this._updateSvg(rects);
    }

    private _updateSvg(rects: any) {
        const z = Math.max(this.dimensions.tileSize - 2, 0);
        rects.enter().append("rect").merge(rects)
            .attr("transform", (x) => this._translate(x as any))
            .attr("width", z)
            .attr("height", z)
            .style("fill", (tile: any) => {
                return d3.color(this.colors.get(tile.node.state)) as any;
            })
            .style("stroke-width", (tile: any) => {
                return tile.node.id === this.selectedNodeId.value ? "2px" : "0";
            })
            .on("click", (tile) => {
                this.selectedNodeId.next(tile.node.id);
                this._updateSvg(rects);
            });
    }

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
}
