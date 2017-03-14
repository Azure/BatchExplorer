import { AfterViewInit, Component, ElementRef, ViewChild, Input, OnChanges } from "@angular/core";
import * as d3 from "d3";

const margin = {
    top: 5,
    right: 5,
    bottom: 15,
    left: 5,
};

const totalPercent = 2 / 3;
const padRad = 0.025;


/*
    Utility methods
  */
function percToDeg(perc) {
    return perc * 360;
};

function percToRad(perc) {
    return degToRad(percToDeg(perc));
};

function degToRad(deg) {
    return deg * Math.PI / 180;
};


export interface GaugeConfig {
    min?: number;
    max?: number;
    showLabels?: boolean;
}

const defaultOptions: GaugeConfig = {
    min: 0,
    max: 1,
    showLabels: true,
};

@Component({
    selector: "bl-gauge",
    templateUrl: "gauge.html",
})
export class GaugeComponent implements AfterViewInit, OnChanges {
    @Input()
    public value: number = 0.5;

    @Input()
    public set options(options: GaugeConfig) {
        this._options = Object.assign({}, defaultOptions, options);
    }
    public get options() { return this._options; };


    @ViewChild("gauge")
    public gaugeEl: ElementRef;

    public percent = 0;

    private _svg: d3.Selection<any, any, any, any>;
    private _chart: d3.Selection<any, any, any, any>;
    private _arc1: d3.Arc<any, d3.DefaultArcObject>;
    private _arc2: d3.Arc<any, d3.DefaultArcObject>;

    private _dimensions = {
        width: 0,
        height: 0,
        barWidth: 0,
        radius: 0,
        outerWidth: 0,
        outerHeight: 0,
    };

    private _labels = {
        min: null,
        max: null,
        value: null,
    };

    private _options: GaugeConfig = defaultOptions;

    constructor(private elementRef: ElementRef) {
    }


    public ngAfterViewInit() {
        console.log("This", this.elementRef.nativeElement.offsetWidth);
        this.init();
        this.redraw();
    }

    public ngOnChanges(inputs) {
        if (inputs.value || inputs.percent) {
            this._computePercent();
        }
        if (inputs.value) {
            if (this._svg) {
                this.redraw();
            }
        }

        if (inputs.options) {
            console.log(inputs.options)
        }
    }

    public init() {
        this._computeDimensions();
        const { width, height, radius, barWidth, outerHeight, outerWidth } = this._dimensions;
        const el = d3.select(this.gaugeEl.nativeElement);
        this._svg = el.append("svg")
            .attr("width", outerWidth)
            .attr("height", outerHeight);

        const chart = this._chart = this._svg.append("g")
            .attr("transform", "translate(" + (outerWidth / 2) + ", " + (outerHeight / 2) + ")");
        chart.append("path").attr("class", "arc chart-filled");
        chart.append("path").attr("class", "arc chart-empty");

        const chartInset = 10;

        this._arc2 = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth);
        this._arc1 = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth);

        this._createLabels();
    }

    public redraw() {
        this._animateTo(this.percent);
        // this._repaintGauge(this.percent);
        if (this.options.showLabels) {
            this._updateLabels();
        } else {
            this._clearLabels();
        }
    }

    private _oldPercent = 0;

    private _animateTo(percent) {
        const oldPercent = this._oldPercent;
        this._chart.transition().delay(300).ease(d3.easeQuadIn).duration(1500)
            .tween("progress", (_, index, items) => {
                const sel = items[index];
                return (percentOfPercent) => {
                    console.log("percentOf", percentOfPercent);
                    const progress = oldPercent + percentOfPercent * (percent - oldPercent);
                    this._oldPercent = progress;

                    this._repaintGauge(progress);
                    return d3.select(sel).attr("d", this._recalcPointerPos(progress));
                };
            });
    }
    private _recalcPointerPos(perc) {
        const { width, radius } = this._dimensions;
        const thetaRad = percToRad(perc / 2);
        const centerX = 0;
        const centerY = 0;
        const topX = centerX - width * Math.cos(thetaRad);
        const topY = centerY - width * Math.sin(thetaRad);
        const leftX = centerX - radius * Math.cos(thetaRad - Math.PI / 2);
        const leftY = centerY - radius * Math.sin(thetaRad - Math.PI / 2);
        const rightX = centerX - radius * Math.cos(thetaRad + Math.PI / 2);
        const rightY = centerY - radius * Math.sin(thetaRad + Math.PI / 2);
        return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
    };


    private _repaintGauge(perc) {
        const ratio = 2 / 3;
        let next_start = totalPercent;
        let arcStartRad = percToRad(next_start);
        let arcEndRad = arcStartRad + percToRad(perc * ratio);
        next_start += perc * ratio;


        this._arc1.startAngle(arcStartRad).endAngle(arcEndRad);

        arcStartRad = percToRad(next_start);
        arcEndRad = arcStartRad + percToRad((1 - perc) * ratio);

        this._arc2.startAngle(arcStartRad + padRad).endAngle(arcEndRad);


        this._chart.select(".chart-filled").attr("d", this._arc1);
        this._chart.select(".chart-empty").attr("d", this._arc2);
    }

    private _computeDimensions() {
        const outerWidth = this.elementRef.nativeElement.offsetWidth;
        const width = outerWidth - margin.left - margin.right;
        const height = width;
        const outerHeight = height + margin.top + margin.bottom;
        const radius = width / 2;
        const barWidth = 40 * width / 300;

        this._dimensions = {
            width, height, radius, barWidth, outerWidth, outerHeight,
        }
    }

    private _computePercent() {
        const { min, max } = this._options;
        this.percent = (this.value - min) / (max - min);
    }

    private _createLabels() {
        const { width, height, radius, barWidth, outerHeight, outerWidth } = this._dimensions;
        const centerX = outerWidth / 2;
        const centerY = outerHeight / 2;
        const offX = Math.sin(degToRad(50)) * (radius - barWidth / 2);
        const offY = Math.cos(degToRad(50)) * (radius - barWidth / 2);

        const minLabel = this._svg.append("text")
            .classed("min-label", true)
            .attr("dx", centerX - offX)
            .attr("dy", centerY + offY)
            .attr("text-anchor", "middle")
        const maxLabel = this._svg.append("text")
            .classed("max-label", true)
            .attr("dx", centerX + offX)
            .attr("dy", centerY + offY)
            .attr("text-anchor", "middle");

        const valueFontSize = 20;

        const valueLabel = this._svg.append("text")
            .classed("val-label", true)
            .attr("dx", centerX)
            .attr("dy", centerY - valueFontSize / 2)
            .style("font-size", valueFontSize)
            .attr("text-anchor", "middle");

        this._svg.append("text")
            .classed("val-legend", true)
            .attr("dx", centerX)
            .attr("dy", centerY + valueFontSize / 2)
            .attr("text-anchor", "middle")
            .text("banana");

        this._labels = { min: minLabel, max: maxLabel, value: valueLabel };
    }

    private _updateLabels() {
        const { min, max, value } = this._labels;
        min.text(this.options.min);
        max.text(this.options.max);
        value.text(Math.floor(this.value * 100) / 100);
    }

    private _clearLabels() {
        this._svg.selectAll("text").remove();
    }
}
