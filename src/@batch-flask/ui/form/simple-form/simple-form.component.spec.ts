import { Component, DebugElement, NO_ERRORS_SCHEMA, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import { ButtonComponent } from "@batch-flask/ui/buttons";
import { SimpleFormComponent } from "@batch-flask/ui/form/simple-form";
import { ServerErrorComponent } from "@batch-flask/ui/server-error";
import { complexFormMockComponents } from "test/utils/mocks/components";

@Component({
    template: `
        <bl-simple-form
            [submit]="submit"
            [containerRef]="dialogRef"
            [formGroup]="form"
            title="Simple form title"
            subtitle="Simple form subtitle">
        </bl-simple-form>
    `,
})
export class FormTestComponent {
    @ViewChild("banner", { static: true })
    public actionForm: SimpleFormComponent;

    public form: FormGroup;

    public dialogRef = {
        close: jasmine.createSpy("dialogRef.close"),
    };

    public submit = jasmine.createSpy("submit");

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            id: ["", Validators.required],
            state: [""],
        });
    }
}

describe("SimpleFormComponent", () => {
    let fixture: ComponentFixture<FormTestComponent>;
    let testComponent: FormTestComponent;
    let simpleFormEl: DebugElement;
    let component: SimpleFormComponent;

    let complexFormEl: DebugElement;
    let pageFormEl: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, MaterialModule],
            declarations: [
                ButtonComponent,
                FormTestComponent,
                ServerErrorComponent,
                SimpleFormComponent,
                complexFormMockComponents,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(FormTestComponent);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
        simpleFormEl = fixture.debugElement.query(By.css("bl-simple-form"));
        component = simpleFormEl.componentInstance;

        complexFormEl = simpleFormEl.query(By.css("bl-complex-form"));
        pageFormEl = complexFormEl.query(By.css("bl-form-page"));
    });

    it("should pass params to the create form component", () => {
        expect(complexFormEl).not.toBeFalsy();
        expect(pageFormEl).not.toBeFalsy();
    });

    it("page should have title and subtitle", () => {
        expect(pageFormEl.componentInstance.title).toEqual("Simple form title");
        expect(pageFormEl.componentInstance.subtitle).toEqual("Simple form subtitle");
    });

    it("should pass the dialogRef", () => {
        expect(component.containerRef).toEqual(testComponent.dialogRef as any);
    });

    it("should pass the submit method", () => {
        expect(complexFormEl.componentInstance.submit).toEqual(testComponent.submit);
    });
});
