import { Component, DebugElement, NO_ERRORS_SCHEMA, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { ServerError, autobind } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ButtonComponent } from "@batch-flask/ui/buttons";
import {
    ComplexFormComponent, FormPageComponent, FormPickerComponent, FormSectionComponent,
} from "@batch-flask/ui/form";
import { FormFooterComponent } from "@batch-flask/ui/form/complex-form/footer";
import { PermissionService } from "@batch-flask/ui/permission";
import { ServerErrorComponent } from "@batch-flask/ui/server-error";
import { AsyncSubject } from "rxjs";
import { click } from "test/utils/helpers";

const date = new Date(2017, 9, 13, 23, 43, 38);

@Component({
    template: `
        <bl-complex-form [formGroup]="form" [submit]="submit" [containerRef]="sidebarRef" >
            <bl-form-page title="Main page" subtitle="Main subtitle" [formGroup]="form">
                <bl-form-section title="General section" subtitle="General information">
                    <input  formControlName="id" />
                    <input  formControlName="state"/>
                </bl-form-section>
                <bl-form-section title="Secondary section" subtitle="Secondary information">
                    <bl-form-picker formControlName="pickedValue" #picker name="Nested page title">
                        <div no-value-title>Pick something</div>
                        <div value-title>Got something</div>
                        <div nested-form>
                            <input class="nested-input" [formControl]="picker.nestedValue"/>
                        </div>
                    </bl-form-picker>
                </bl-form-section>
            </bl-form-page>
        </bl-complex-form>
    `,
})
export class FormTestComponent {
    @ViewChild("banner")
    public createForm: ComplexFormComponent;

    public form: FormGroup;

    public sidebarRef = {
        destroy: jasmine.createSpy("sidebarRef.destroy"),
    };

    public submitSpy = jasmine.createSpy("submit");

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            id: ["", Validators.required],
            state: [""],
            pickedValue: [""],
        });
    }

    @autobind()
    public submit() {
        this.submitSpy();
        const sub = new AsyncSubject();
        if (this.form.value.id === "error") {
            const value = `Id already exists\nRequestId:abc-def\nTime:${date.toISOString()}`;
            sub.error(ServerError.fromBatch({ statusCode: 408, code: "IdExists", message: { value } }));
        } else {
            sub.next(true);
            sub.complete();
        }
        return sub;
    }
}

describe("ComplexFormComponent", () => {
    let fixture: ComponentFixture<FormTestComponent>;
    let testComponent: FormTestComponent;
    let de: DebugElement;
    let component: ComplexFormComponent;
    let createFormElement: DebugElement;
    let addButton: DebugElement;
    let addAndCloseButton: DebugElement;
    let addButtonComponent: ButtonComponent;
    let addAndCloseButtonComponent: ButtonComponent;

    function getErrorElement(): DebugElement {
        return createFormElement.query(By.css(".error-banner"));
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, I18nTestingModule],
            declarations: [
                ButtonComponent,
                FormTestComponent,
                ServerErrorComponent,
                ComplexFormComponent,
                FormPageComponent,
                FormSectionComponent,
                FormPickerComponent,
                FormFooterComponent,
            ],
            providers: [
                { provide: PermissionService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(FormTestComponent);
        testComponent = fixture.componentInstance;
        fixture.detectChanges();
        de = fixture.debugElement;
        createFormElement = de.query(By.css("bl-complex-form"));
        component = createFormElement.componentInstance;

        // Get the buttons
        addButton = createFormElement.query(By.css("bl-button.add"));
        addAndCloseButton = createFormElement.query(By.css("bl-button.add-and-close"));
        addButtonComponent = addButton && addButton.componentInstance;
        addAndCloseButtonComponent = addAndCloseButton && addAndCloseButton.componentInstance;
    });

    it("buttons should be present and disabled by default", () => {
        expect(addButton).not.toBeNull();
        expect(addAndCloseButton).not.toBeNull();

        expect(addButtonComponent.disabled).toBe(true);
        expect(addAndCloseButtonComponent.disabled).toBe(true);
    });

    it("should not have any erros by default", () => {
        expect(getErrorElement()).toBe(null);
    });

    it("buttons should become valid when form is valid", () => {
        fixture.componentInstance.form.patchValue({
            id: "some-id",
        });
        fixture.detectChanges();

        expect(addButtonComponent.disabled).toBe(false);
        expect(addAndCloseButtonComponent.disabled).toBe(false);
    });

    it("should close the sidebar when clicking add and close", fakeAsync(() => {
        fixture.componentInstance.form.patchValue({
            id: "id-1",
        });
        fixture.detectChanges();

        addAndCloseButtonComponent.handleAction({} as any);
        expect(fixture.componentInstance.submitSpy).toHaveBeenCalledTimes(1);
        tick(); // For asyncsjubject
        tick(1000); // For the timeout to close
        expect(fixture.componentInstance.sidebarRef.destroy).toHaveBeenCalledTimes(1);
    }));

    it("should not close the sidebar when clicking add", fakeAsync(() => {
        fixture.componentInstance.form.patchValue({
            id: "id-1",
        });
        fixture.detectChanges();

        addButtonComponent.handleAction({} as any);
        expect(fixture.componentInstance.submitSpy).toHaveBeenCalledTimes(1);
        tick();
        tick(1000);
        expect(fixture.componentInstance.sidebarRef.destroy).not.toHaveBeenCalled();
    }));

    describe("when form return an error", () => {
        beforeEach(() => {
            fixture.componentInstance.form.patchValue({
                id: "error",
            });
            fixture.detectChanges();
            addButtonComponent.handleAction({} as any);
            fixture.detectChanges();
        });

        it("should show an error when submit return error", () => {
            expect(component.showError).toBe(true);
            expect(fixture.componentInstance.sidebarRef.destroy).not.toHaveBeenCalled();
            const error = getErrorElement();
            expect(error).not.toBe(null);
            expect(error.nativeElement.textContent).toContain("IdExists");
            expect(error.nativeElement.textContent).toContain("Id already exists");
        });

        it("should toggle the error when clicking the warning button", () => {
            const toggleBtn = de.query(By.css("bl-form-footer .toggle-error-btn > button"));
            expect(toggleBtn).not.toBeFalsy("Error toggle button should be defined");

            // Toggle hidden
            click(toggleBtn);
            fixture.detectChanges();

            expect(component.showError).toBe(false);
            let error = getErrorElement();
            expect(error).toBe(null);

            // Toggle visible again
            click(toggleBtn);
            fixture.detectChanges();

            expect(component.showError).toBe(true);
            error = getErrorElement();
            expect(error).not.toBe(null);
        });
    });

    it("Should have 2 sections", () => {
        const sections = de.queryAll(By.css(".form-section"));
        expect(sections.length).toBe(2);
        const sectionTitles = sections.map(x => x.query(By.css(".section-title")));
        expect(sectionTitles[0].nativeElement.textContent).toContain("1");
        expect(sectionTitles[0].nativeElement.textContent).toContain("General section");
        expect(sectionTitles[0].nativeElement.textContent).toContain("General information");
        expect(sectionTitles[1].nativeElement.textContent).toContain("2");
        expect(sectionTitles[1].nativeElement.textContent).toContain("Secondary section");
        expect(sectionTitles[1].nativeElement.textContent).toContain("Secondary information");
    });

    describe("Picker", () => {
        let pickerEl: DebugElement;
        let picker: FormPickerComponent;

        beforeEach(() => {
            pickerEl = de.query(By.css("bl-form-picker"));
            picker = pickerEl.componentInstance;
        });

        it("Should show the no value message first", () => {
            expect(pickerEl.nativeElement.textContent).toContain("Pick something");
        });

        it("Should not show the new page", () => {
            expect(pickerEl.nativeElement.textContent).not.toContain("Nested page title");
        });

        it("Should not show the input", () => {
            expect(de.query(By.css("inputnested-input"))).toBeFalsy();
        });

        describe("When clicking on picker", () => {
            beforeEach(() => {
                click(pickerEl.query(By.css("button")));
                fixture.detectChanges();
                picker.nestedValue.setValue("Some");
            });

            it("should open a new page when clicking", () => {
                expect(de.nativeElement.textContent).not.toContain("Main page");
                expect(de.nativeElement.textContent).toContain("Nested page title");
            });

            it("should have the input", () => {
                const input = de.query(By.css("input.nested-input"));
                expect(input).not.toBeFalsy();
                expect(input.nativeElement.value).toBe("Some");
            });

            it("click cancel should close the page and not set", () => {
                const cancelButton = de.query(By.css(".form-buttons .cancel"));
                click(cancelButton);
                fixture.detectChanges();

                expect(de.nativeElement.textContent).toContain("Main page");
                expect(de.nativeElement.textContent).not.toContain("Nested page title");

                expect(pickerEl.nativeElement.textContent).toContain("Pick something");
                expect(testComponent.form.value.pickedValue).toBe("");
            });

            it("click select should close the page and set value", () => {
                const cancelButton = de.query(By.css(".form-buttons .select"));
                click(cancelButton);
                fixture.detectChanges();

                expect(de.nativeElement.textContent).toContain("Main page");
                expect(de.nativeElement.textContent).not.toContain("Nested page title");

                expect(pickerEl.nativeElement.textContent).toContain("Got something");
                expect(testComponent.form.value.pickedValue).toBe("Some");
            });
        });
    });
});
