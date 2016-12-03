import { Component, DebugElement, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { By } from "@angular/platform-browser";
import { autobind } from "core-decorators";
import { AsyncSubject } from "rxjs";

import { SubmitButtonComponent } from "app/components/base/buttons";
import { CreateFormComponent } from "app/components/base/create-form";

@Component({
    template: `
        <bex-create-form [formGroup]="form" [submit]="submit" [sidebarRef]="sidebarRef" >
            <div [formGroup]="form">
                <input  formControlName="id" />
                <input  formControlName="state"/>
            </div>
        </bex-create-form>
    `,
})
export class FormTestComponent {
    @ViewChild("banner")
    public createForm: CreateFormComponent;

    public form: FormGroup;

    public sidebarRef = {
        destroy: jasmine.createSpy("sidebarRef.destroy"),
    };

    public submitSpy = jasmine.createSpy("submit");

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            id: ["", Validators.required],
            state: [""],
        });
    }

    @autobind()
    public submit() {
        this.submitSpy();
        const sub = new AsyncSubject();
        if (this.form.value.id === "error") {
            sub.error({ code: "IdExists", message: { value: "Id already exists" } });
        } else {
            sub.next(true);
            sub.complete();
        }
        return sub;
    }
}

describe("CreateFormComponent", () => {
    let fixture: ComponentFixture<FormTestComponent>;
    let createFormElement: DebugElement;
    let addButton: DebugElement;
    let addAndCloseButton: DebugElement;
    let addButtonComponent: SubmitButtonComponent;
    let addAndCloseButtonComponent: SubmitButtonComponent;

    function getErrorElement(): DebugElement {
        return createFormElement.query(By.css(".error-banner"));
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, MaterialModule.forRoot()],
            declarations: [
                SubmitButtonComponent,
                FormTestComponent,
                CreateFormComponent,
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(FormTestComponent);
        fixture.detectChanges();
        createFormElement = fixture.debugElement.query(By.css("bex-create-form"));

        // Get the buttons
        addButton = createFormElement.query(By.css("bex-submit-btn.add"));
        addAndCloseButton = createFormElement.query(By.css("bex-submit-btn.add-and-close"));
        addButtonComponent = addButton && addButton.componentInstance;
        addAndCloseButtonComponent = addAndCloseButton && addAndCloseButton.componentInstance;
    });

    it("buttons should be present and disabled by default", () => {
        expect(addButton).not.toBeNull();
        expect(addAndCloseButton).not.toBeNull();

        expect(addButtonComponent.disabled).toBe(true);
        expect(addAndCloseButtonComponent.disabled).toBe(true);
    });

    it("add button should allow multisubmit", () => {
        expect(addButtonComponent.multiSubmit).toBe(true);
        expect(addAndCloseButtonComponent.multiSubmit).toBe(false);
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

        addAndCloseButtonComponent.onClick();
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

        addButtonComponent.onClick();
        expect(fixture.componentInstance.submitSpy).toHaveBeenCalledTimes(1);
        tick();
        tick(1000);
        expect(fixture.componentInstance.sidebarRef.destroy).not.toHaveBeenCalled();
    }));

    it("should show an error when submit return error", () => {
        fixture.componentInstance.form.patchValue({
            id: "error",
        });
        fixture.detectChanges();
        addButtonComponent.onClick();
        fixture.detectChanges();

        expect(fixture.componentInstance.sidebarRef.destroy).not.toHaveBeenCalled();
        const error = getErrorElement();
        expect(error).not.toBe(null);
        expect(error.nativeElement.textContent).toContain("IdExists");
        expect(error.nativeElement.textContent).toContain("Id already exists");
    });
});
