import { Component, DebugElement, forwardRef } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { FormModule } from "@batch-flask/ui/form";
import { updateInput } from "test/utils/helpers";
import { MultiInstanceSettingsPickerComponent } from "./multi-instance-settings-picker.component";

@Component({
    template: `<bl-multi-instance-settings-picker [formControl]="control"></bl-multi-instance-settings-picker>`,
})
class TestComponent {
    public control = new FormControl();
}

@Component({
    selector: "bl-resourcefile-picker",
    template: "",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MockResourceFilePickerComponent), multi: true },
    ],
})
class MockResourceFilePickerComponent implements ControlValueAccessor {
    public writeValue(obj: any): void {
        // nothing
    }
    public registerOnChange(fn: any): void {
        // nothing
    }
    public registerOnTouched(fn: any): void {
        // nothing
    }

}

describe("MultiInstanceSettingsPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let commandLineEl: DebugElement;
    let numberOfInstancesEl: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormModule, FormsModule, ReactiveFormsModule],
            declarations: [MultiInstanceSettingsPickerComponent, TestComponent, MockResourceFilePickerComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-multi-instance-settings-picker"));
        fixture.detectChanges();

        commandLineEl = de.query(By.css("textarea[formControlName=coordinationCommandLine]"));
        numberOfInstancesEl = de.query(By.css("input[formControlName=numberOfInstances]"));
    });

    it("Has the right inputs", () => {
        expect(commandLineEl).not.toBeFalsy();
        expect(numberOfInstancesEl).not.toBeFalsy();
    });

    it("applies the changes to the inputs", () => {
        testComponent.control.setValue({
            coordinationCommandLine: "hostname",
            numberOfInstances: 5,
        });
        fixture.detectChanges();
        expect(commandLineEl.nativeElement.value).toEqual("hostname");
        expect(numberOfInstancesEl.nativeElement.value).toEqual("5");
    });

    it("proagate changes upstream", () => {
        updateInput(commandLineEl, "ping -n 100 azure.com");

        expect(testComponent.control.value).toEqual({
            coordinationCommandLine: "ping -n 100 azure.com",
            numberOfInstances: 1,
            commonResourceFiles: [],
        });
        updateInput(numberOfInstancesEl, 3);

        expect(testComponent.control.value).toEqual({
            coordinationCommandLine: "ping -n 100 azure.com",
            numberOfInstances: 3,
            commonResourceFiles: [],
        });
    });
});
