import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from "@angular/core";
import * as d3 from "d3";

import { GaugeConfig, defaultOptions } from "./gauge-config";
import { degToRad, invalidSizeMessage, percToRad, presetSizes } from "./gauge-utils";

const margin = {
    top: 5,
    right: 5,
    bottom: 15,
    left: 5,
};

/**
 * Capacity of the gauge
 * 0.5 => This will make half a dnought
 * 2/3 => Makes a dashboard looking gauge
 */
const ratio = 2 / 3;

/**
 * Angle at which the gauge starts
 * 180 => Bottom middle
 * 240 => Left bottom
 * 270 => Left middle
 */
const startingAngle = 240;

const padRad = 0.025;

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

    @Input()
    public set size(value: string | number) {
        if (typeof value === "string" && value in presetSizes) {
            this._size = presetSizes[value];
        } else if (typeof value === "number") {
            this._size = 200;
        } else {
            throw invalidSizeMessage(value);
        }
    }

    @ViewChild("gauge")
    public gaugeEl: ElementRef;

    public percent = 0;

    private _svg: d3.Selection<any, any, any, any>;
    private _chart: d3.Selection<any, any, any, any>;
    /**
     * Arc representing the filled part of the gauge
     */
    private _filledArc: d3.Arc<any, d3.DefaultArcObject>;

    /**
     * Arc representing the empty part of the gauge
     */
    private _emptyArc: d3.Arc<any, d3.DefaultArcObject>;

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

    /**
     * Last value the percentage shown on the gauge was updated to.
     * This is different from the percent value which represent the actual percentage.
     * This one is used for smooth transition between values.
     */
    private _currentDisplayedPercent = 0;

    private _options: GaugeConfig = defaultOptions;
    private _size: number = presetSizes.small;

    constructor(private elementRef: ElementRef) {
    }

    public ngAfterViewInit() {
        this.init();
        this.redraw();
    }

    public ngOnChanges(inputs) {
        if (inputs.size) {
            this._computeDimensions();
        }
        if (inputs.value || inputs.percent) {
            this._computePercent();
        }
        if (inputs.value) {
            if (this._svg) {
                this.redraw();
            }
        }

        if (inputs.options) {
            this._computePercent();
            const current = inputs.options.currentValue;
            const previous = inputs.options.previousValue;
            this._processOptionChange(current, previous);
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

        this._emptyArc = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth);
        this._filledArc = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth);

        this._createLabels();
    }

    public redraw() {
        this._animateTo(this.percent);
        if (this.options.showLabels) {
            this._updateLabels();
        } else {
            this._clearLabels();
        }
    }

    private _animateTo(percent) {
        this._chart.transition().delay(300).ease(d3.easeCubicInOut).duration(1000)
            .tween("progress", (_, index, items) => {
                const sel = items[index];
                return (percentOfPercent) => {
                    const oldPercent = this._currentDisplayedPercent;
                    const progress = oldPercent + percentOfPercent * (percent - oldPercent);

                    this._repaintGauge(progress);
                    return d3.select(sel);
                };
            });
    }

    /**
     * Repaint the arcs of the gauge.
     * @param perc Percentage we want to show.(This allow for animation instead of using this.percent)
     */
    private _repaintGauge(perc) {
        this._currentDisplayedPercent = perc;
        let arcStartRad = degToRad(startingAngle);
        let arcEndRad = arcStartRad + percToRad(perc * ratio);

        this._filledArc.startAngle(arcStartRad).endAngle(arcEndRad);

        arcStartRad = arcEndRad;
        arcEndRad = arcStartRad + percToRad((1 - perc) * ratio);

        this._emptyArc.startAngle(arcStartRad + padRad).endAngle(arcEndRad);

        this._chart.select(".chart-filled").attr("d", this._filledArc);
        this._chart.select(".chart-empty").attr("d", this._emptyArc);
    }

    /**
     * Compute all dimensions needed for displaying the gauge.
     */
    private _computeDimensions() {
        const outerWidth = this._size;
        const width = outerWidth - margin.left - margin.right;
        const height = width;
        const outerHeight = height + margin.top + margin.bottom;
        const radius = width / 2;
        const barWidth = 40 * width / 300;

        this._dimensions = {
            width, height, radius, barWidth, outerWidth, outerHeight,
        };
    }

    /**
     * Compute the percent of the gauge filled from the value using the min and max
     */
    private _computePercent() {
        const { min, max } = this._options;
        this.percent = (this.value - min) / (max - min);
    }

    /**
     * This function will apply changes to d3 if some options changed
     * @param current Current options
     * @param previous Previous options
     */
    private _processOptionChange(current: GaugeConfig, previous: GaugeConfig) {
        current = Object.assign({}, defaultOptions, current);
        previous = Object.assign({}, defaultOptions, previous);

        if (current.showLabels !== previous.showLabels) {
            if (current.showLabels) {
                this._createLabels();
                this._updateLabels();
            } else {
                this._clearLabels();
            }
        }
    }

    /**
     * Create and position labels
     */
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
            .attr("text-anchor", "middle");

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

    /**
     * Update the values of the labels
     */
    private _updateLabels() {
        const { min, max, value } = this._labels;
        min.text(this.options.min);
        max.text(this.options.max);
        value.text(Math.floor(this.value * 100) / 100);
    }

    /**
     * Remove all the labels.
     */
    private _clearLabels() {
        this._svg.selectAll("text").remove();
    }
}
