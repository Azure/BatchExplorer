import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { I18nUIModule, SelectComponent } from "@batch-flask/ui";
import { FormModule } from "@batch-flask/ui/form";
import * as moment from "moment";
import { click, updateInput } from "test/utils/helpers";
import { DurationPickerComponent, DurationUnit } from "./duration-picker.component";
import { DurationPickerModule } from "./duration-picker.module";
@Component({
    template: `
        <bl-duration-picker label="My duration picker"
            [formControl]="control"
            [allowUnlimited]="allowUnlimited">
        </bl-duration-picker>
    `,
})
class TestComponent {
    public allowUnlimited = true;
    public control = new FormControl();
}

@Component({
    template: `
        <bl-form-field>
            <bl-duration-picker label="My duration picker"
                [formControl]="control"
                [allowUnlimited]="allowUnlimited">
            </bl-duration-picker>
        </bl-form-field>
    `,
})
class TestWithFormFieldComponent extends TestComponent {
}

describe("DurationPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: DurationPickerComponent;
    let de: DebugElement;

    let inputEl: DebugElement;
    let selectComponent: SelectComponent;

    async function setupFor(type) {
        TestBed.configureTestingModule({
            imports: [FormModule, DurationPickerModule, ReactiveFormsModule, I18nTestingModule, I18nUIModule],
            declarations: [type],
        });
        fixture = TestBed.createComponent(type);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-duration-picker"));
        component = de.componentInstance;
        fixture.detectChanges();

        inputEl = de.query(By.css("input"));
        selectComponent = de.query(By.css("bl-select")).componentInstance;
        await fixture.whenStable();
    }

    describe("when picker standalone", () => {
        beforeEach(async () => {
            await setupFor(TestComponent);
        });

        it("It set unit to unlimited by default", () => {
            expect(component.time).toEqual("");
            expect(component.unit).toEqual(DurationUnit.Unlimited);
            expect(component.value).toBe(null);
            expect(inputEl.nativeElement.value).toEqual("");
            expect(selectComponent.value).toEqual(DurationUnit.Unlimited);
        });

        it("should disable input when unit is unlimited", async () => {
            expect(inputEl.nativeElement.disabled).toBe(true);
        });

        describe("when unit change to hour", () => {
            beforeEach(async () => {
                selectComponent.selectOption(selectComponent.options
                    .filter(x => x.value === DurationUnit.Hours).first());
                selectComponent.notifyChanges();
                fixture.detectChanges();
                await fixture.whenStable();
            });

            it("should have updated unit", () => {
                expect(component.unit).toEqual(DurationUnit.Hours);
            });

            it("should enable input", () => {
                expect(inputEl.nativeElement.disabled).toBe(false);
            });

            it("shows error if value is not a valid number", () => {
                updateInput(inputEl, "invalid-num");
                fixture.detectChanges();
                expect(component.time).toBe("invalid-num");
                const errors = de.queryAll(By.css(".error"));
                expect(errors.length).toBe(1);
                expect(errors[0].nativeElement.textContent).toContain("Input should be a valid number");
                expect(testComponent.control.valid).toBe(false, "Testcomponent control should be invalid");
            });

            it("update value when time is valid", () => {
                updateInput(inputEl, "15");
                fixture.detectChanges();
                expect(component.time).toBe("15");
                expect(de.queryAll(By.css(".error")).length).toBe(0, "Should not have any errors");
                expect(moment.isDuration(component.value)).toBe(true);
                expect(testComponent.control.value.toISOString()).toEqual("PT15H");
            });

            it("should disable input and select when disabled", async () => {
                testComponent.control.disable();
                fixture.detectChanges();
                await fixture.whenStable();
                expect(component.disabled).toBe(true, "Duration picker should be disabled");
                expect(inputEl.nativeElement.disabled).toBe(true, "Input is disabled");
                expect(selectComponent.disabled).toBe(true, "Unit select is disabled");
            });
        });

        describe("when unit change to custom", () => {
            beforeEach(async () => {
                selectComponent.selectOption(selectComponent.options
                    .filter(x => x.value === DurationUnit.Custom).first());
                selectComponent.notifyChanges();
                fixture.detectChanges();
                await fixture.whenStable();
            });

            it("should have updated unit", () => {
                expect(component.unit).toEqual(DurationUnit.Custom);
            });

            it("should enable input", () => {
                expect(inputEl.nativeElement.disabled).toBe(false);
            });

            it("shows error if value is not a valid duration", () => {
                updateInput(inputEl, "invalid-duration");
                fixture.detectChanges();
                expect(component.time).toBe("invalid-duration");
                const errors = de.queryAll(By.css(".error"));
                expect(errors.length).toBe(1);
                expect(errors[0].nativeElement.textContent).toContain("This is not a valid ISO 8601 duration");
                expect(testComponent.control.valid).toBe(false, "Testcomponent control should be invalid");
            });

            it("update value when duration is valid", () => {
                updateInput(inputEl, "P4DT4H");
                fixture.detectChanges();
                expect(component.time).toBe("P4DT4H");
                expect(de.queryAll(By.css(".error")).length).toBe(0, "Should not have any errors");
                expect(moment.isDuration(component.value)).toBe(true);
                expect(testComponent.control.value.toISOString()).toEqual("P4DT4H");
            });
        });

        describe("writing value", () => {
            it("set day units when value is in days", () => {
                testComponent.control.setValue(moment.duration("P5D"));
                fixture.detectChanges();
                expect(component.unit).toEqual(DurationUnit.Days);
                expect(component.time).toEqual("5");
            });

            it("set day units when value is in hours", () => {
                testComponent.control.setValue(moment.duration("PT17H"));
                fixture.detectChanges();
                expect(component.unit).toEqual(DurationUnit.Hours);
                expect(component.time).toEqual("17");
            });

            it("set unlimited when value is null", () => {
                testComponent.control.setValue(null);
                fixture.detectChanges();
                expect(component.unit).toEqual(DurationUnit.Unlimited);
                expect(component.time).toEqual("");
            });

            it("set to hours when value is null and allow unlimited is false", () => {
                testComponent.allowUnlimited = false;
                testComponent.control.setValue(null);
                fixture.detectChanges();
                expect(component.unit).toEqual(DurationUnit.Hours);
                expect(component.time).toEqual("");
            });
        });
    });

    describe("when picker in form-field", () => {
        let labelEl: DebugElement;

        beforeEach(async () => {
            await setupFor(TestWithFormFieldComponent);
            labelEl = fixture.debugElement.query(By.css(".bl-form-field-label"));
        });

        it("should show placeholder as label", () => {
            expect(labelEl.nativeElement.textContent).toContain("My duration picker");
        });

        it("should focus select when clicking on label if unit not unlimited", async () => {
            click(fixture.debugElement.query(By.css("bl-form-field")));
            fixture.detectChanges();
            await fixture.whenStable();
            expect(de.query(By.css("bl-select .select-button")).nativeElement).toEqual(document.activeElement);
        });

        it("should focus input when clicking on label if unit not unlimited", async () => {
            component.unit = DurationUnit.Hours;
            fixture.detectChanges();
            await fixture.whenStable();
            click(fixture.debugElement.query(By.css("bl-form-field")));
            fixture.detectChanges();
            expect(inputEl.nativeElement).toEqual(document.activeElement);
        });
    });
});
