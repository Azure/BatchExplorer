import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

import { FormErrorComponent } from "app/components/base/form-error";

@Component({
    template: `
        <form [formGroup]="form">
            <input formControlName="id">
            <bex-error #idRequiredError controlName="id" code="required">Id is required</bex-error>
            <bex-error #idMaxLengthError controlName="id" code="maxlength">Id is max 5 char long</bex-error>

            <div formGroupName="os">
                <input formControlName="name">
                <bex-error #osNameError controlName="name" code="required">Name of os is required</bex-error>
            </div>
        </form>
    `,
})
export class FormErrorTestComponent {
    @ViewChild("idRequiredError")
    public idRequiredError: FormErrorComponent;

    @ViewChild("idMaxLengthError")
    public idMaxLengthError: FormErrorComponent;

    @ViewChild("osNameError")
    public osNameError: FormErrorComponent;

    public form: FormGroup;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            id: ["", [Validators.required, Validators.maxLength(5)]],
            os: formBuilder.group({
                name: ["", Validators.required],
            }),
        });
    }

}

describe("FormErrorComponent", () => {
    let fixture: ComponentFixture<FormErrorTestComponent>;
    let component: FormErrorTestComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            declarations: [
                FormErrorComponent,
                FormErrorTestComponent,
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(FormErrorTestComponent);
        fixture.detectChanges();
        component = fixture.componentInstance;
    });

    it("Should show error for control at the root of a control group", () => {
        component.form.patchValue({ id: "" });
        fixture.detectChanges();
        expect(component.idRequiredError.hasError).toBe(true);
        expect(component.idMaxLengthError.hasError).toBe(false);

        expect(fixture.nativeElement.textContent).toContain("Id is required");
        expect(fixture.nativeElement.textContent).not.toContain("Id is max 5 char long");
    });

    it("Should show error for control at the root of a control group with a different error", () => {
        component.form.patchValue({ id: "waytoolong" });
        fixture.detectChanges();
        expect(component.idRequiredError.hasError).toBe(false);
        expect(component.idMaxLengthError.hasError).toBe(true);

        expect(fixture.nativeElement.textContent).not.toContain("Id is required");
        expect(fixture.nativeElement.textContent).toContain("Id is max 5 char long");
    });

    it("Should show error in nested group", () => {
        component.form.patchValue({ os: { name: "" } });
        fixture.detectChanges();

        expect(component.osNameError.hasError).toBe(true);
        expect(fixture.nativeElement.textContent).toContain("Name of os is required");
    });

    it("Fixing error in nested group should not show the error text", () => {
        component.form.patchValue({ os: { name: "centos" } });
        fixture.detectChanges();

        expect(component.osNameError.hasError).toBe(false);
        expect(fixture.nativeElement.textContent).not.toContain("Name of os is required");
    });
});
