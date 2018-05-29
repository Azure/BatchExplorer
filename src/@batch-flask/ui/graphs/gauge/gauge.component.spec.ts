import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import * as d3 from "d3";

import { GaugeComponent, GaugeConfig } from "@batch-flask/ui/graphs/gauge";

@Component({
    template: `<bl-gauge [value]="value" options [options]="options" [size]="size"></bl-gauge>`,
})
class TestComponent {
    public size: string | number = "small";
    public value = 10;
    public options: GaugeConfig = {
        min: 0,
        max: 100,
        title: "Test gauge",
    };
}

describe("GaugeComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: GaugeComponent;
    let de: DebugElement;
    let svg: d3.Selection<any, any, any, any>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [GaugeComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-gauge"));
        component = de.componentInstance;
        fixture.detectChanges();
        svg = d3.select(component.gaugeEl.nativeElement).select("svg");
    });

    it("should compute the right dimensions when size is medium", () => {
        testComponent.size = "medium";
        fixture.detectChanges();

        expect(component.dimensions.outerWidth).toBe(200);
        expect(component.dimensions.outerHeight).toBe(200);
    });

    it("should compute the right dimensions when size is a number", () => {
        testComponent.size = 230;
        fixture.detectChanges();

        expect(component.dimensions.outerWidth).toBe(230);
        expect(component.dimensions.outerHeight).toBe(230);
    });

    it("should have created a svg with the right size", () => {
        expect(svg.empty()).toBeFalsy("There should be a svg");
        expect(svg.attr("width")).toBe("150");
        expect(svg.attr("height")).toBe("150");
    });

    it("svg contains a chart should be centered and a square", () => {
        const chart = svg.select("g");
        expect(chart.empty()).toBe(false);
        expect(chart.attr("transform")).toBe("translate(75, 75)");
    });

    it("should not overflow if value is more than max", () => {
        testComponent.value = 150;
        fixture.detectChanges();
        expect(component.percent).toEqual(1);
    });

    it("should be less than 0 if value is less than min", () => {
        testComponent.value = -10;
        fixture.detectChanges();
        expect(component.percent).toEqual(0);
    });

    describe("Labels", () => {
        let minLabel;
        let maxLabel;
        let valLabel;
        let valLegend;

        beforeEach(() => {
            minLabel = svg.select("text.min-label");
            maxLabel = svg.select("text.max-label");
            valLabel = svg.select("text.val-label");
            valLegend = svg.select("text.val-legend");
        });

        it("should show all the labels", () => {
            expect(minLabel.empty()).toBe(false);
            expect(maxLabel.empty()).toBe(false);
            expect(valLabel.empty()).toBe(false);
            expect(valLegend.empty()).toBe(false);

            expect(minLabel.text()).toBe("0");
            expect(maxLabel.text()).toBe("100");
            expect(valLabel.text()).toBe("10");
            expect(valLegend.text()).toBe("Test gauge");
        });

        it("should update the labels when value change", () => {
            testComponent.value = 47;
            fixture.detectChanges();

            expect(minLabel.empty()).toBe(false);
            expect(maxLabel.empty()).toBe(false);
            expect(valLabel.empty()).toBe(false);
            expect(valLegend.empty()).toBe(false);

            expect(minLabel.text()).toBe("0");
            expect(maxLabel.text()).toBe("100");
            expect(valLabel.text()).toBe("47");
            expect(valLegend.text()).toBe("Test gauge");
        });

        it("should update the labels when options change", () => {
            testComponent.options = {
                min: -10,
                max: 10,
                title: "New title",
            };
            fixture.detectChanges();

            expect(minLabel.empty()).toBe(false);
            expect(maxLabel.empty()).toBe(false);
            expect(valLabel.empty()).toBe(false);
            expect(valLegend.empty()).toBe(false);

            expect(minLabel.text()).toBe("-10");
            expect(maxLabel.text()).toBe("10");
            expect(valLabel.text()).toBe("10");
            expect(valLegend.text()).toBe("New title");
        });

        it("should remove all labels if showLabels is false", () => {
            testComponent.options = {
                min: 0,
                max: 100,
                title: "Test gauge",
                showLabels: false,
            };

            fixture.detectChanges();

            minLabel = svg.select("text.min-label");
            maxLabel = svg.select("text.max-label");
            valLabel = svg.select("text.val-label");
            valLegend = svg.select("text.val-legend");

            expect(minLabel.empty()).toBe(true);
            expect(maxLabel.empty()).toBe(true);
            expect(valLabel.empty()).toBe(true);
            expect(valLegend.empty()).toBe(true);
        });

        it("should add a tooltip if labels tooltip is provided", () => {
            testComponent.options = {
                min: 0,
                max: 100,
                title: "Test gauge",
                labels: {
                    min: { tooltip: "Min tooltip" },
                },
            };
            fixture.detectChanges();
            expect(minLabel.text()).toContain("0");
            const tooltip = minLabel.select("title");
            expect(tooltip.empty()).toBe(false);
            expect(tooltip.text()).toEqual("Min tooltip");

            expect(maxLabel.select("title").empty()).toBe(true);
            expect(valLabel.select("title").empty()).toBe(true);
        });

        it("should override label value if provided in the labels option", () => {
            testComponent.options = {
                min: 0,
                max: 100,
                title: "Test gauge",
                labels: {
                    min: { value: "Start" },
                },
            };
            fixture.detectChanges();

            expect(minLabel.text()).toBe("Start");
            expect(maxLabel.text()).toBe("100");
            expect(valLabel.text()).toBe("10");
        });
    });
});
