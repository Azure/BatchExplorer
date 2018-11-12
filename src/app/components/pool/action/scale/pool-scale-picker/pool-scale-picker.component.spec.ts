import { Component, DebugElement, Input, forwardRef } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { MatRadioGroup, MatRadioModule } from "@angular/material";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { DurationPickerComponent, DurationPickerModule, FormModule, I18nUIModule } from "@batch-flask/ui";
import { Pool } from "app/models";
import { duration } from "moment";
import { click, updateInput } from "test/utils/helpers";
import { PoolScalePickerComponent } from "./pool-scale-picker.component";

@Component({
    template: `<bl-pool-scale-picker [formControl]="control"></bl-pool-scale-picker>`,
})
class TestComponent {
    public control = new FormControl();
}

export interface Inputs {
    targetDedicatedNodes: DebugElement;
    targetLowPriorityNodes: DebugElement;
    resizeTimeout: DurationPickerComponent;
    autoScaleEvaluationIntervalEl: DurationPickerComponent;
    autoScaleFormula: MockAutoscaleFormulaPickerComponent;
}

@Component({
    selector: "bl-autoscale-formula-picker",
    template: "",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MockAutoscaleFormulaPickerComponent), multi: true },
    ],
})
class MockAutoscaleFormulaPickerComponent implements ControlValueAccessor {
    @Input() public pool: Pool;

    public value: any;
    private _change: any;

    public writeValue(value: any): void {
        if (value !== this.value) {
            this.value = value;
            if (this._change) {
                this._change(value);
            }
        }
    }

    public registerOnChange(fn: any): void {
        this._change = fn;
    }

    public registerOnTouched(fn: any): void {
        // nothing
    }

}

describe("PoolScalePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let typeSelection: MatRadioGroup;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                DurationPickerModule, I18nTestingModule, I18nUIModule,
                ReactiveFormsModule, FormsModule, MatRadioModule, FormModule,
            ],
            declarations: [PoolScalePickerComponent, TestComponent, MockAutoscaleFormulaPickerComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-pool-scale-picker"));
        fixture.detectChanges();

        typeSelection = de.query(By.css("mat-radio-group[formControlName=enableAutoScale]"))
            .injector.get<MatRadioGroup>(MatRadioGroup);
    });

    function getFormElements(): Inputs {
        const resizeTimeoutEl = de.query(By.css("bl-duration-picker[formControlName=resizeTimeout]"));
        const intervalEl = de.query(By.css("bl-duration-picker[formControlName=autoScaleEvaluationInterval]"));
        const autoScaleFormulaEl = de.query(By.css("bl-autoscale-formula-picker"));
        return {
            targetDedicatedNodes: de.query(By.css("input[formControlName=targetDedicatedNodes]")),
            targetLowPriorityNodes: de.query(By.css("input[formControlName=targetLowPriorityNodes]")),
            resizeTimeout: resizeTimeoutEl && resizeTimeoutEl.componentInstance,
            autoScaleFormula: autoScaleFormulaEl && autoScaleFormulaEl.componentInstance,
            autoScaleEvaluationIntervalEl: intervalEl && intervalEl.componentInstance,
        };
    }

    it("set defaults when value from parent is null", () => {
        expect(typeSelection.value).toBe(false);
        const formEls = getFormElements();

        expect(formEls.targetDedicatedNodes).not.toBeFalsy();
        expect(formEls.targetDedicatedNodes.nativeElement.value).toEqual("0");

        expect(formEls.targetLowPriorityNodes).not.toBeFalsy();
        expect(formEls.targetDedicatedNodes.nativeElement.value).toEqual("0");

        expect(formEls.resizeTimeout).not.toBeFalsy();
        expect(formEls.resizeTimeout.value).toEqual(duration("PT15M"));

    });

    it("shows the autoscale elements when enable autoscale is true", () => {
        testComponent.control.setValue({
            enableAutoScale: true,
        });
        fixture.detectChanges();

        expect(typeSelection.value).toBe(true);
        const formEls = getFormElements();

        expect(formEls.autoScaleFormula).not.toBeFalsy();
        expect(formEls.autoScaleEvaluationIntervalEl).not.toBeFalsy();

        expect(formEls.targetDedicatedNodes).toBeFalsy();
        expect(formEls.targetLowPriorityNodes).toBeFalsy();
        expect(formEls.resizeTimeout).toBeFalsy();
    });

    it("updates the form when selecting radio button", () => {
        click(de.queryAll(By.css("mat-radio-button label"))[1].nativeElement);
        fixture.detectChanges();

        expect(testComponent.control.value).toEqual({
            enableAutoScale: true,
            autoScaleFormula: "",
            autoScaleEvaluationInterval: duration("PT15M"),
        });

        expect(typeSelection.value).toBe(true);
        const formEls = getFormElements();
        formEls.autoScaleFormula.writeValue("$target = 3;");

        expect(testComponent.control.value).toEqual({
            enableAutoScale: true,
            autoScaleFormula: "$target = 3;",
            autoScaleEvaluationInterval: duration("PT15M"),
        });
    });

    it("updates the parent when selecting fixed mode settings", () => {
        const els = getFormElements();
        updateInput(els.targetDedicatedNodes, "7");
        updateInput(els.targetLowPriorityNodes, "2");

        expect(testComponent.control.value).toEqual({
            enableAutoScale: false,
            targetDedicatedNodes: 7,
            targetLowPriorityNodes: 2,
            resizeTimeout: duration("PT15M"),
        });
    });
});
