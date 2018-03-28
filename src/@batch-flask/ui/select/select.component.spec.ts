import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ClickableComponent } from "@batch-flask/ui/buttons/clickable";
import { PermissionService } from "@batch-flask/ui/permission";
import { SelectOptionComponent } from "./option";
import { SelectComponent } from "./select.component";

const baseOptions = [
    { value: "opt-1", label: "Potato" },
    { value: "opt-2", label: "Banana" },
    { value: "opt-3", label: "Carrot" },
    { value: "opt-4", label: "Pasta", disabled: true },
    { value: "opt-5", label: "Rice" },
];

// tslint:disable:trackBy-function
@Component({
    template: `
        <bl-select placeholder="Myselect" [ngModel]="value" [filterable]="filterable" [multiple]="multiple">
            <bl-option
                *ngFor="let option of options"
                [value]="option.value"
                [label]="option.label"
                [multiple]="multiple"
                [disabled]="option.disabled">

            </bl-option>
        </bl-select>
    `,
})
class TestComponent {
    public options: any[] = baseOptions;
    public value = null;
}

fdescribe("SelectComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: SelectComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [SelectComponent, SelectOptionComponent, ClickableComponent, TestComponent],
            providers: [
                { provide: PermissionService, useValue: null },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-select"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("Should show placeholder when no value", () => {
        console.log("De.", de.nativeElement);
        expect(de.nativeElement.textContent).toContain("Myselect");
    });

    it("Should show value when picked", () => {
        testComponent.value = "opt-3";
        fixture.detectChanges();
        expect(de.nativeElement.textContent).toContain("Myselect");
    });

    it("list all options when clicking on button", () => {

    });
});
