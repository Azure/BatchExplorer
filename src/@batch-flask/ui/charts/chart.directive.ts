import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
} from "@angular/core";

// tslint:disable-next-line
const Chart = require("chart.js");
import { getColors } from "./helpers";

@Directive({ selector: "canvas[blChart]" })
export class ChartDirective implements OnDestroy, OnChanges, OnInit {

    @Input() public data: number[] | any[];
    @Input() public datasets: any[];
    @Input() public labels: string[] = [];
    @Input() public options: Chart.ChartOptions = {};
    @Input() public chartType: string;
    @Input() public colors: any[];
    @Input() public legend: boolean;

    /**
     * Emit when clicking on an chart element.
     */
    @Output() public elClick = new EventEmitter();
    @Output() public elDblClick = new EventEmitter();
    @Output() public elContextMenu = new EventEmitter();
    @Output() public hover = new EventEmitter();

    public ctx: any;
    public chart: Chart;
    private initFlag: boolean = false;

    public constructor(private _element: ElementRef) { }

    @HostListener("click", ["$event"])
    public handleClick(event: MouseEvent) {
        const el = this.chart.getElementAtEvent(event)[0];
        if (el) {
            this.elClick.emit(el);
        }
    }

    @HostListener("dblClick", ["$event"])
    public handleDblClick(event: MouseEvent) {
        const el = this.chart.getElementAtEvent(event)[0];
        if (el) {
            this.elDblClick.emit(el);
        }
    }
    @HostListener("contextmenu", ["$event"])
    public handleContextMenu(event: MouseEvent) {
        const el = this.chart.getElementAtEvent(event)[0];
        if (el) {
            this.elContextMenu.emit(el);
        }
    }

    public ngOnInit(): any {
        this.ctx = this._element.nativeElement.getContext("2d");
        this.initFlag = true;
        if (this.data || this.datasets) {
            this._refresh();
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (!this.initFlag) {
            return;
        }

        // Check if the changes are in the data or datasets
        if (changes.data || changes.datasets) {
            if (changes.data) {
                this.updateChartData(this.data);
                this.chart.update();
            } else {
                const { previousValue, currentValue } = changes.datasets;
                if (previousValue && currentValue && previousValue.length !== currentValue.length) {
                    this._refresh();
                } else {
                    this.updateChartData(this.datasets);
                    this.chart.update();
                }
            }

        }
        if (changes.options || changes.labels || changes.colors || changes.chartType) {
            // otherwise rebuild the chart
            this._refresh();
        }
    }

    public ngOnDestroy(): any {
        this._destroyChart();
    }

    public getChartBuilder(ctx: any/*, data:Array<any>, options:any*/): any {
        const datasets = this.getDatasets();

        const options: Chart.ChartOptions = Object.assign({}, this.options);
        if (this.legend === false) {
            options.legend = { display: false };
        }

        options.hover = options.hover || {};
        if (!options.hover.onHover) {
            options.hover.onHover = (active: any[]) => {
                if (active && !active.length) {
                    return;
                }
                this.hover.emit({ active });
            };
        }

        if (!options.onClick) {
            options.onClick = (event: any) => {
                const el = this.chart.getElementAtEvent(event)[0];
                if (el) {
                    this.elClick.emit(el);
                }
            };
        }

        const opts = {
            type: this.chartType,
            data: {
                labels: this.labels,
                datasets: datasets,
            },
            options: options,
        };

        return new Chart(ctx, opts);
    }

    private updateChartData(newDataValues: number[] | any[]): void {
        if (newDataValues.length === 0) {
            return;
        }
        if (Array.isArray(newDataValues[0].data)) {
            this.chart.data.datasets.forEach((dataset: any, i: number) => {
                dataset.data = newDataValues[i].data;

                if (newDataValues[i].label) {
                    dataset.label = newDataValues[i].label;
                }
            });
        } else {
            this.chart.data.datasets[0].data = newDataValues;
        }
    }

    private getDatasets(): any {
        let datasets: any = void 0;
        // in case if datasets is not provided, but data is present
        if (!this.datasets || !this.datasets.length && (this.data && this.data.length)) {
            if (Array.isArray(this.data[0])) {
                datasets = (this.data as number[][]).map((data: number[], index: number) => {
                    return { data, label: this.labels[index] || `Label ${index}` };
                });
            } else {
                datasets = [{ data: this.data, label: `Label 0` }];
            }
        }

        if (this.datasets && this.datasets.length ||
            (datasets && datasets.length)) {
            datasets = (this.datasets || datasets)
                .map((elm: number, index: number) => {
                    const newElm: any = Object.assign({}, elm);
                    if (!newElm.borderColor) {
                        if (this.colors && this.colors.length) {
                            Object.assign(newElm, this.colors[index]);
                        } else {
                            Object.assign(newElm, getColors(this.chartType, index, newElm.data.length));
                        }
                    }
                    return newElm;
                });
        }

        return datasets;
    }

    private _refresh(): any {
        this._destroyChart();
        this.chart = this.getChartBuilder(this.ctx);
    }

    private _destroyChart() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = void 0;
        }
    }
}
