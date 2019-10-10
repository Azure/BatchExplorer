import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { FormErrorComponent } from "@batch-flask/ui/form/form-error";

@Component({
    template: `
        <form [formGroup]="form">
            <input formControlName="id">
            <bl-error #idRequiredError controlName="id" code="required">Id is required</bl-error>
            <bl-error #idMaxLengthError controlName="id" code="maxlength">Id is max 5 char long</bl-error>

            <div formGroupName="os">
                <input formControlName="name">
                <bl-error #osNameError controlName="name" code="required">Name of os is required</bl-error>
            </div>
        </form>
    `,
})
export class FormErrorTestComponent {
    @ViewChild("idRequiredError", { static: true })
    public idRequiredError: FormErrorComponent;

    @ViewChild("idMaxLengthError", { static: true })
    public idMaxLengthError: FormErrorComponent;

    @ViewChild("osNameError", { static: true })
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
        component.form.get("id").markAsTouched();
        fixture.detectChanges();

        expect(component.idRequiredError.hasError).toBe(true);
        expect(component.idMaxLengthError.hasError).toBe(false);

        expect(fixture.nativeElement.textContent).toContain("Id is required");
        expect(fixture.nativeElement.textContent).not.toContain("Id is max 5 char long");
    });

    it("should not show error if the input is not touched", () => {
        component.form.patchValue({ id: "" });
        component.form.get("id").markAsUntouched();
        fixture.detectChanges();
        expect(component.idRequiredError.hasError).toBe(false);
        expect(component.idMaxLengthError.hasError).toBe(false);
    });

    it("Should show error for control at the root of a control group with a different error", () => {
        component.form.patchValue({ id: "waytoolong" });
        component.form.get("id").markAsTouched();
        fixture.detectChanges();
        expect(component.idRequiredError.hasError).toBe(false);
        expect(component.idMaxLengthError.hasError).toBe(true);

        expect(fixture.nativeElement.textContent).not.toContain("Id is required");
        expect(fixture.nativeElement.textContent).toContain("Id is max 5 char long");
    });

    it("Should show error in nested group", () => {
        component.form.patchValue({ os: { name: "" } });
        component.form.get("os").get("name").markAsTouched();

        fixture.detectChanges();

        expect(component.osNameError.hasError).toBe(true);
        expect(fixture.nativeElement.textContent).toContain("Name of os is required");
    });

    it("Fixing error in nested group should not show the error text", () => {
        component.form.patchValue({ os: { name: "centos" } });
        component.form.get("os").get("name").markAsTouched();
        fixture.detectChanges();

        expect(component.osNameError.hasError).toBe(false);
        expect(fixture.nativeElement.textContent).not.toContain("Name of os is required");
    });
});
