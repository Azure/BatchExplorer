import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { FormModule } from "@batch-flask/ui/form";
import { InputDirective } from "@batch-flask/ui/form/input";
import { SelectComponent } from "@batch-flask/ui/select";
import { DurationPickerComponent, DurationUnit } from "./duration-picker.component";
import { DurationPickerModule } from "./duration-picker.module";

@Component({
    template: `
        <bl-duration-picker label="My duration picker" [formControl]="control" [allowUnlimited]="allowUnlimited">
        </bl-duration-picker>
    `,
})
class TestComponent {
    public allowUnlimited = true;
    public control = new FormControl(null);
}

fdescribe("DurationPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    // let testComponent: TestComponent;
    let component: DurationPickerComponent;
    let de: DebugElement;

    let inputEl: DebugElement;
    let selectComponent: SelectComponent;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [FormModule, DurationPickerModule, ReactiveFormsModule],
            declarations: [TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        // testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-duration-picker"));
        component = de.componentInstance;
        fixture.detectChanges();

        inputEl = de.query(By.css("input"));
        selectComponent = de.query(By.css("bl-select")).componentInstance;
        await fixture.whenStable();
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
        beforeEach(() => {
            selectComponent.writeValue(DurationUnit.Hours);
            fixture.detectChanges();
        });

        it("should enable input", () => {
            expect(inputEl.nativeElement.disabled).toBe(false);
        });
    });
});
