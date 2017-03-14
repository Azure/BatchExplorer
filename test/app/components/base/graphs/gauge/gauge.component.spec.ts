import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import * as d3 from "d3";

import { GaugeComponent, GaugeConfig } from "app/components/base/graphs/gauge";

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

fdescribe("GaugeComponent", () => {
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

        expect(component.dimensions.outerWidth).toBe(300);
        expect(component.dimensions.outerHeight).toBe(310);
    });


    it("should compute the right dimensions when size is a number", () => {
        testComponent.size = 230;
        fixture.detectChanges();

        expect(component.dimensions.outerWidth).toBe(230);
        expect(component.dimensions.outerHeight).toBe(240);
    });

    it("should have created a svg with the right size", () => {
        expect(svg.empty()).toBeFalsy("There should be a svg");
        expect(svg.attr("width")).toBe("200");
        expect(svg.attr("height")).toBe("210");
    });

    it("svg contains a chart should be centered and a square", () => {
        const chart = svg.select("g");
        expect(chart.empty()).toBe(false);
        expect(chart.attr("transform")).toBe("translate(100, 100)");
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
    });
});
