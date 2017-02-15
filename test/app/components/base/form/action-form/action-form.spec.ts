import { Component, DebugElement, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { By } from "@angular/platform-browser";
import { autobind } from "core-decorators";
import { AsyncSubject } from "rxjs";

import { SubmitButtonComponent } from "app/components/base/buttons";
import { ActionFormComponent } from "app/components/base/form/action-form";
import { ServerErrorComponent } from "app/components/base/form/server-error";
import { ServerError } from "app/models";

@Component({
    template: `
        <bex-action-form  class="with-form" [formGroup]="form" [submit]="submit" [dialogRef]="dialogRef" >
            <div [formGroup]="form" >
                <input  formControlName="id" />
                <input  formControlName="state"/>
            </div>
        </bex-action-form>

         <bex-action-form class="without-form" [submit]="submit" [dialogRef]="dialogRef" >
        </bex-action-form>
    `,
})
export class FormTestComponent {
    @ViewChild("banner")
    public actionForm: ActionFormComponent;

    public form: FormGroup;

    public dialogRef = {
        close: jasmine.createSpy("dialogRef.close"),
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
            const value = "Id already exists\nRequestId:abc-def\ntime:2016-12-08T18";
            sub.error(ServerError.fromBatch({ statusCode: 408, code: "IdExists", message: { value } }));
        } else {
            sub.next(true);
            sub.complete();
        }
        return sub;
    }
}

describe("ActionFormComponent", () => {
    let fixture: ComponentFixture<FormTestComponent>;
    let actionFormElement: DebugElement;
    let actionButton: DebugElement;
    let actionButtonComponent: SubmitButtonComponent;

    function getErrorElement(): ServerErrorComponent {
        return actionFormElement.query(By.css("bex-server-error")).componentInstance;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, MaterialModule.forRoot()],
            declarations: [
                SubmitButtonComponent,
                FormTestComponent,
                ServerErrorComponent,
                ActionFormComponent,
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(FormTestComponent);
        fixture.detectChanges();
        actionFormElement = fixture.debugElement.query(By.css("bex-action-form.with-form"));

        // Get the buttons
        actionButton = actionFormElement.query(By.css("bex-submit-btn.submit"));
        actionButtonComponent = actionButton && actionButton.componentInstance;
    });

    it("buttons should be present and disabled by default", () => {
        expect(actionButton).not.toBeNull();

        expect(actionButtonComponent.disabled).toBe(true);
    });

    it("buttons should be enabled if form is not defined", () => {
        const formEl = fixture.debugElement.query(By.css("bex-action-form.without-form"));

        actionButton = formEl.query(By.css("bex-submit-btn.submit"));

        expect(actionButton.componentInstance.disabled).toBe(false);
    });

    it("action button should allow multisubmit", () => {
        expect(actionButtonComponent.multiSubmit).toBe(true);
    });

    it("should not have any erros by default", () => {
        expect(getErrorElement().error).toBe(null);
    });

    it("buttons should become valid when form is valid", () => {
        fixture.componentInstance.form.patchValue({
            id: "some-id",
        });
        fixture.detectChanges();

        expect(actionButtonComponent.disabled).toBe(false);
    });

    it("should close the dialog when clicking add and close", fakeAsync(() => {
        fixture.componentInstance.form.patchValue({
            id: "id-1",
        });
        fixture.detectChanges();

        actionButtonComponent.onClick();
        expect(fixture.componentInstance.submitSpy).toHaveBeenCalledTimes(1);
        tick(); // For asyncsjubject
        tick(1000); // For the timeout to close
        expect(fixture.componentInstance.dialogRef.close).toHaveBeenCalledTimes(1);
    }));

    describe("when form return an error", () => {
        beforeEach(() => {
            fixture.componentInstance.form.patchValue({
                id: "error",
            });
            fixture.detectChanges();
            actionButtonComponent.onClick();
            fixture.detectChanges();
        });

        it("should show an error when submit return error", () => {
            expect(fixture.componentInstance.dialogRef.close).not.toHaveBeenCalled();
            const error = getErrorElement();
            expect(error.error).not.toBeNull();
        });
    });
});
