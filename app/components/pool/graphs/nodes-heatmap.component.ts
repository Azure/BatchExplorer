import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from "@angular/core";
import * as d3 from "d3";
import * as elementResizeDetectorMaker from "element-resize-detector";
import { List } from "immutable";

import { Node, NodeState } from "app/models";
import { HeatmapColor } from "./heatmap-color";
import { StateCounter } from "./state-counter";
import { StateTree } from "./state-tree";

interface HeatmapTile {
    index: number;
    node: Node;
}

const availableStates = [
    ...Array(40).fill(NodeState.idle),
    ...Array(20).fill(NodeState.running),
    ...Array(4).fill(NodeState.waitingForStartTask),
    ...Array(3).fill(NodeState.offline),
    ...Array(1).fill(NodeState.creating),
    ...Array(1).fill(NodeState.starting),
    ...Array(1).fill(NodeState.rebooting),
    ...Array(1).fill(NodeState.reimaging),
    ...Array(1).fill(NodeState.leavingPool),
    ...Array(1).fill(NodeState.startTaskFailed),
    ...Array(1).fill(NodeState.unusable),
    ...Array(1).fill(NodeState.unknown),
];

const stateTree: StateTree = [
    { state: NodeState.idle, color: "#6ba3cb" },
    { state: NodeState.running, color: "#388e3c" },
    { state: NodeState.waitingForStartTask, color: "#94bdd9" },
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

@Component({
    selector: "bex-nodes-heatmap",
    templateUrl: "nodes-heatmap.html",
    viewProviders: [
        { provide: "StateTree", useValue: stateTree },
    ],
})
export class NodesHeatmapComponent implements AfterViewInit, OnDestroy {
    public colors: HeatmapColor;

    @Input()
    public poolId: string;

    @ViewChild("heatmap")
    public heatmapEl: ElementRef;

    @Input()
    public set nodes(nodes: List<Node>) {
        if (nodes.size > maxNodes) {
            console.warn(`Only supporting up to ${maxNodes} nodes for now!`);
        }
        this._nodes = List<Node>(nodes.slice(0, maxNodes));
        this._processNewNodes();
    }
    public get nodes() { return this._nodes; };
    public selectedNode: Node = null;
    public highlightedState: string;

    private _nodes: List<Node>;

    private _erd: any;
    private _svg: d3.Selection<any, any, any, any>;
    private _width: number = 960;
    private _height: number = 500;
    private _tileSize: number;
    private _rows: number;
    private _columns: number;

    constructor(private elementRef: ElementRef, private changeDetector: ChangeDetectorRef) {
        this.colors = new HeatmapColor(stateTree);
    }

    public ngAfterViewInit() {
        this._erd = elementResizeDetectorMaker({
            strategy: "scroll",
        });

        this._erd.listenTo(this.heatmapEl.nativeElement, (element) => {
            this._width = this.heatmapEl.nativeElement.offsetWidth;
            this._height = this.heatmapEl.nativeElement.offsetHeight;
            this._svg.attr("width", this._width)
                .attr("height", this._height);
            this.redraw();
        });

        this._svg = d3.select(this.heatmapEl.nativeElement).append("svg")
            .attr("width", this._width)
            .attr("height", this._height);
        this._processNewNodes();
    }

    public ngOnDestroy() {
        this._erd.uninstall(this.elementRef.nativeElement);
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

        const tiles = this._nodes.map((node, index) => { return { node, index }; });
        const rects = this._svg.selectAll("rect").data(tiles.toJS());

        rects.exit().remove();
        this._updateSvg(rects);
    }

    private _updateSvg(rects: any) {
        const z = this._tileSize - 2;
        rects.enter().append("rect").merge(rects)
            .attr("transform", (x) => this._translate(x as any))
            .attr("width", z)
            .attr("height", z)
            .style("cursor", "pointer")
            .style("fill", (tile: any) => {
                return d3.color(this.colors.get(tile.node.state)) as any;
            }).on("click", (tile) => {
                this.selectedNode = tile.node;
            });
    }

    private _computeDimensions() {
        const area = this._height * this._width;
        const areaPerTile = area / this._nodes.size;
        let estimatedSize = Math.floor(Math.sqrt(areaPerTile));
        let rows = this._height / estimatedSize;
        let columns = this._width / estimatedSize;
        this._computeBestDimension(rows, columns);
        this._tileSize = Math.min(Math.floor(this._height / this._rows), Math.floor(this._width / this._columns));
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
            this._rows = 0;
            this._columns = 0;
        } else {
            this._rows = options[0].y;
            this._columns = options[0].x;
        }
    }

    private _translate(tile: HeatmapTile) {
        const i = tile.index;
        const z = this._tileSize;
        const c = this._columns;
        const x = ((i % c) * z + 1);
        const y = Math.floor(i / c) * z + 1;
        return `translate(${x}, ${y})`;
    }
}
