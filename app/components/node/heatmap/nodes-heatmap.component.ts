import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import * as d3 from "d3";
import * as elementResizeDetectorMaker from "element-resize-detector";
import { List } from "immutable";

import { Node, NodeState } from "app/models";

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

const stateTree = [
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

@Component({
    selector: "bex-nodes-heatmap",
    templateUrl: "nodes-heatmap.html",
})
export class NodesHeatmapComponent implements AfterViewInit, OnDestroy {
    public colors: any = {};
    public stateTree = stateTree;

    @ViewChild("heatmap")
    public heatmapEl: ElementRef;

    public set nodes(nodes: List<Node>) {
        if (nodes.size > 1000) {
            console.warn("Only supporting up to 1000 nodes for now!");
        }
        this._nodes = List<Node>(nodes.slice(0, 1000));
        this._processNewNodes();
    }
    public get nodes() { return this._nodes; };
    public highlightedState: string;

    private _nodes: List<Node>;

    private _erd: any;
    private _svg: d3.Selection<any, any, any, any>;
    private _width: number = 960;
    private _height: number = 500;
    private _tileSize: number;
    private _rows: number;
    private _columns: number;

    constructor(private elementRef: ElementRef) {
        this._computeColors();
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

        const add = 1000;
        this._nodes = List([]);
        setTimeout(() => {
            const newNodes = [];
            for (let i = 0; i < add; i++) {
                const stateIndex = Math.floor(Math.random() * availableStates.length);
                const state = availableStates[stateIndex];
                newNodes.push(new Node({ id: Math.random().toString(), state: state }));
            }
            this.nodes = List<Node>(this._nodes.concat(newNodes));
        }, 2000);
    }

    public ngOnDestroy() {
        this._erd.uninstall(this.elementRef.nativeElement);
    }

    public selectState(state: string) {
        if (state === this.highlightedState) {
            this.highlightedState = null;
        } else {
            this.highlightedState = state;
        }
        this.redraw();
    }

    public redraw() {
        this._computeColors();
        this._computeDimensions();
        const rects = this._svg.selectAll("rect");
        this._updateSvg(rects);
    }

    private _processNewNodes() {
        const tiles = this._nodes.map((node, index) => { return { node, index }; });
        this._computeDimensions();

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
            .style("fill", (tile: any) => {
                return d3.color(this.colors[tile.node.state]) as any;
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
        this._rows = options[0].y;
        this._columns = options[0].x;
    }

    private _translate(tile: HeatmapTile) {
        const i = tile.index;
        const z = this._tileSize;
        const c = this._columns;
        const x = ((i % c) * z + 1);
        const y = Math.floor(i / c) * z + 1;
        return "translate(" + x + "," + y + ")";
    }

    private _computeColors() {
        const colors = {};
        if (!this.highlightedState) {
            for (let item of stateTree as any) {
                if (item.state) {
                    colors[item.state] = item.color;
                } else {
                    for (let subitem of item.states) {
                        colors[subitem.state] = item.color;
                    }
                }
            }
        } else {
            for (let item of stateTree as any) {
                if (item.state) {
                    colors[item.state] = this._getHighlightColor(item.state, item.color);
                } else {
                    if (item.category === this.highlightedState) {
                        for (let subitem of item.states) {
                            colors[subitem.state] = subitem.color;
                        }
                    } else {
                        for (let subitem of item.states) {
                            if (subitem.state === this.highlightedState) {
                                colors[subitem.state] = subitem.color;
                            } else {
                                colors[subitem.state] = shadeColor2(item.color, 0.8);
                            }
                        }
                    }
                }
            }
        }
        this.colors = colors;
    }

    private _getHighlightColor(key, color) {
        if (key === this.highlightedState) {
            return color;
        } else {
            return shadeColor2(color, 0.8);
        }
    }
}

function shadeColor2(color, percent) {
    var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}
