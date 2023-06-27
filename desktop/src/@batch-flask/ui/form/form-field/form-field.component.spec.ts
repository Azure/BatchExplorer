import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { FormErrorComponent } from "../form-error";
import { HintComponent } from "../hint";
import { InputDirective } from "../input";
import { FormFieldComponent } from "./form-field.component";

@Component({
    template: `
        <bl-form-field>
            <input blInput placeholder="My input label" id="input-custom-1" [formControl]="control">
            <bl-hint id="hint-custom-1">My hint</bl-hint>
            <bl-error id="error-custom-1" [control]="control">My error</bl-error>
        </bl-form-field>
    `,
})
class TestComponent {
    public control = new FormControl("");
}

describe("FormFieldComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;

    let labelEl: DebugElement;
    let inputEl: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule],
            declarations: [FormFieldComponent, TestComponent, HintComponent, FormErrorComponent, InputDirective],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-form-field"));
        fixture.detectChanges();

        labelEl = de.query(By.css("label"));
        inputEl = de.query(By.css("input"));
    });

    it("should show input placeholder as a label not inside input", () => {
        expect(labelEl.nativeElement.textContent).toContain("My input label");
    });

    it("label should have the right attributes", () => {
        expect(labelEl.attributes.for).toEqual("input-custom-1");
        expect(labelEl.attributes["aria-owns"]).toEqual("input-custom-1");
    });

    it("has input described by hints and errors", () => {
        expect(inputEl.attributes["aria-describedby"]).toEqual("error-custom-1 hint-custom-1");
    });
});
