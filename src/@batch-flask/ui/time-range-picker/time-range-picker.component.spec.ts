import { OverlayContainer } from "@angular/cdk/overlay";
import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, inject } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import {
    I18nTestingModule, MockControlValueAccessorComponent, controlValueAccessorProvider,
} from "@batch-flask/core/testing";
import { click } from "test/utils/helpers";
import { ButtonsModule } from "../buttons";
import { CalloutModule } from "../callout";
import { FormModule } from "../form";
import { I18nUIModule } from "../i18n";
import { TimeRangePickerComponent } from "./time-range-picker.component";
import { QuickRanges, TimeRange } from "./time-range.model";

@Component({
    selector: "bl-datetime-picker", template: "",
    providers: [controlValueAccessorProvider(() => FakeDateTimePickerComponent)],
})
class FakeDateTimePickerComponent extends MockControlValueAccessorComponent<Date | null> {

}

@Component({
    template: `<bl-time-range-picker [formControl]="control"></bl-time-range-picker>`,
})
class TestComponent {
    public control = new FormControl(QuickRanges.last24h);
}

describe("TimeRangePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                I18nTestingModule,
                I18nUIModule,
                CalloutModule,
                ReactiveFormsModule,
                FormsModule,
                FormModule,
                ButtonsModule,
            ],
            declarations: [TimeRangePickerComponent, TestComponent, FakeDateTimePickerComponent],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-time-range-picker"));
        fixture.detectChanges();

        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        })();
    });

    afterEach(() => {
        if (overlayContainer) {
            overlayContainer.ngOnDestroy();
        }
    });

    it("shows the selected range as a label", () => {
        expect(de.nativeElement.textContent).toContain("Last 24h");
    });

    describe("when clicking on the button", () => {
        let calloutEl: HTMLElement;
        let start: FakeDateTimePickerComponent;
        let end: FakeDateTimePickerComponent;

        beforeEach(() => {
            click(de.query(By.css(".time-range")));
            fixture.detectChanges();
            calloutEl = overlayContainerElement.querySelector(".time-range-picker-callout");

            [start, end] = fixture.debugElement.queryAll(By.directive(FakeDateTimePickerComponent))
                .map(x => x.componentInstance);
        });

        it("shows the callout", () => {
            expect(calloutEl).not.toBeFalsy();
        });

        it("shows the quick ranges", () => {
            const els = calloutEl.querySelectorAll(".quick-ranges bl-clickable");
            expect(els.length).toEqual(5);
        });

        it("update the value when selecting on of the quick ranges", () => {
            const els = calloutEl.querySelectorAll(".quick-ranges bl-clickable");
            click(els[2]);
            expect(testComponent.control.value).toEqual(QuickRanges.lastWeek);
        });

        it("shows an error when custom range is invalid", () => {
            start.updateValue(new Date(2019, 1, 10));
            end.updateValue(new Date(2019, 1, 5));

            fixture.detectChanges();
            expect(calloutEl.textContent).toContain("time-range-picker.errors.invalidRange");
        });

        it("doesn't shows an error when custom range is valid", () => {
            start.updateValue(new Date(2019, 1, 5));
            end.updateValue(new Date(2019, 1, 10));

            fixture.detectChanges();
            expect(calloutEl.textContent).not.toContain("time-range-picker.errors.invalidRange");
        });

        it("update the time range", () => {
            start.updateValue(new Date(2019, 1, 5));
            end.updateValue(new Date(2019, 1, 10));

            fixture.detectChanges();
            click(calloutEl.querySelector("bl-button"));

            const value = testComponent.control.value;
            expect(value instanceof TimeRange).toBe(true);

            expect(value.start).toEqual(new Date(2019, 1, 5));
            expect(value.end).toEqual(new Date(2019, 1, 10));
        });
    });
});
