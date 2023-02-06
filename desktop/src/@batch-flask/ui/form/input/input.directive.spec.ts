import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { InputDirective } from "./input.directive";

/* eslint-disable @angular-eslint/component-class-suffix */

describe("InputDirective", () => {
    let fixture: ComponentFixture<any>;
    let directive: InputDirective;
    let de: DebugElement;

    function createComponent(comp) {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [InputDirective, comp],
        });
        fixture = TestBed.createComponent(comp);
        de = fixture.debugElement.query(By.css("input"));
        directive = fixture.debugElement.query(By.css("[blInput]")).componentInstance;
        fixture.detectChanges();
    }

    describe("when updating placeholder", () => {
        let testComponent: BlInputWithPlaceholder;

        beforeEach(() => {
            createComponent(BlInputWithPlaceholder);
            testComponent = fixture.componentInstance;
            testComponent.placeholder = "Enter stuff";
            fixture.detectChanges();
        });

        it("directive receive the placeholder", () => {
            expect(directive.placeholder).toEqual("Enter stuff");
        });

        it("should update the input placeholder", () => {
            expect(de.nativeElement.getAttribute("placeholder")).toEqual("Enter stuff");
        });
    });

    describe("when setting disabled", () => {
        let testComponent: BlInputWithDisabled;

        beforeEach(() => {
            createComponent(BlInputWithDisabled);
            testComponent = fixture.componentInstance;
        });

        it("should mark as disabled when set to true", () => {
            testComponent.disabled = true;
            fixture.detectChanges();
            expect(directive.disabled).toBe(true);
            expect(de.nativeElement.disabled).toBe(true);
        });

        it("should mark as enabled when set to false", () => {
            testComponent.disabled = false;
            fixture.detectChanges();
            expect(directive.disabled).toBe(false);
            expect(de.nativeElement.disabled).toBe(false);
        });
    });

    describe("when setting required", () => {
        it("should mark as required based on form control validation", () => {
            createComponent(BlInputWithFormControl);
            const testComponent = fixture.componentInstance;

            fixture.detectChanges();
            expect(de.nativeElement.required).toBeFalsy();

            testComponent.formControl.setValidators(Validators.required);
            testComponent.formControl.updateValueAndValidity();
            fixture.detectChanges();
            expect(de.nativeElement.required).toBe(true);
            expect(de.nativeElement.getAttribute("aria-required")).toBe("true");

            testComponent.formControl.clearValidators();
            fixture.detectChanges();
            expect(de.nativeElement.required).toBe(false);
            expect(de.nativeElement.getAttribute("aria-required"))
                .toBeFalsy();
        });
        it("should mark as required based on attribute", () => {
            createComponent(BlInputWithRequired);
            const testComponent = fixture.componentInstance;

            testComponent.required = true;
            fixture.detectChanges();
            expect(de.nativeElement.required).toBe(true);

            // Attribute overrides form control validation
            testComponent.required = false;
            testComponent.formControl.setValidators(Validators.required);
            testComponent.formControl.updateValueAndValidity();
            fixture.detectChanges();
            expect(de.nativeElement.required).toBe(false);
            expect(de.nativeElement.getAttribute("aria-required"))
                .toBeFalsy();
        });
    });

    describe("when using a form control", () => {
        let testComponent: BlInputWithFormControl;

        beforeEach(() => {
            createComponent(BlInputWithFormControl);
            testComponent = fixture.componentInstance;
        });

        it("should disable the form when disabling the form control", () => {
            testComponent.formControl.disable();
            fixture.detectChanges();
            expect(de.nativeElement.disabled).toBe(true);

            // Reenable
            testComponent.formControl.enable();
            fixture.detectChanges();
            expect(de.nativeElement.disabled).toBe(false);
        });
    });
});

@Component({
    template: `<input blInput [placeholder]="placeholder">`,
})
class BlInputWithPlaceholder {
    public placeholder = null;
}

@Component({
    template: `<input blInput [disabled]="disabled">`,
})
class BlInputWithDisabled {
    public disabled: boolean;
}

@Component({
    template: `<input blInput [required]="required">`,
})
class BlInputWithRequired {
    public required: boolean;
    public formControl = new FormControl();
}

@Component({
    template: `<input blInput [formControl]="formControl">`,
})
class BlInputWithFormControl {
    public formControl = new FormControl();
}
