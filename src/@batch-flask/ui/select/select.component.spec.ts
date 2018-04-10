import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ClickableComponent } from "@batch-flask/ui/buttons/clickable";
import { PermissionService } from "@batch-flask/ui/permission";
import { F } from "test/utils";
import { click, updateInput } from "test/utils/helpers";
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
        <bl-select placeholder="Myselect" [(ngModel)]="value" [filterable]="filterable" [multiple]="multiple">
            <bl-option
                *ngFor="let option of options"
                [value]="option.value"
                [label]="option.label"
                [disabled]="option.disabled">

            </bl-option>
        </bl-select>
    `,
})
class TestComponent {
    public options: any[] = baseOptions;
    public value = null;
    public filterable = false;
    public multiple = false;
}

describe("SelectComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let selectButtonEl: DebugElement;

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
        selectButtonEl = de.query(By.css(".select-button"));
        fixture.detectChanges();
    });

    it("Should show placeholder when no value", () => {
        expect(de.nativeElement.textContent).toContain("Myselect");
    });

    it("Should show value when picked", () => {
        testComponent.value = "opt-3";
        fixture.detectChanges();
        expect(de.nativeElement.textContent).toContain("Myselect");
    });

    it("list all options when clicking on button", () => {
        click(selectButtonEl);
        fixture.detectChanges();
        expect(de.query(By.css(".dropdown"))).not.toBeFalsy();
        const options = de.queryAll(By.css(".option"));
        expect(options.length).toBe(5);
        expect(options[0].nativeElement.textContent).toContain("Potato");
        expect(options[1].nativeElement.textContent).toContain("Banana");
        expect(options[2].nativeElement.textContent).toContain("Carrot");
        expect(options[3].nativeElement.textContent).toContain("Pasta");
        expect(options[4].nativeElement.textContent).toContain("Rice");
    });

    it("disabled options should have the disabled class", () => {
        click(selectButtonEl);
        fixture.detectChanges();
        const options = de.queryAll(By.css(".option.disabled"));
        expect(options.length).toBe(1);
        expect(options[0].nativeElement.textContent).toContain("Pasta");
    });

    it("clicking on an options should select it and close dropdown", () => {
        click(selectButtonEl);
        fixture.detectChanges();

        const options = de.queryAll(By.css(".option"));
        click(options[2]);
        fixture.detectChanges();

        expect(testComponent.value).toBe("opt-3");

        expect(de.query(By.css(".dropdown"))).toBeFalsy();
    });

    it("clicking on disabled options should not do anything", () => {
        click(selectButtonEl);
        fixture.detectChanges();

        const options = de.queryAll(By.css(".option"));
        click(options[3]);
        fixture.detectChanges();

        expect(testComponent.value).toBe(null);

        expect(de.query(By.css(".dropdown"))).not.toBeFalsy();
    });

    describe("when select allows multiple values", () => {
        beforeEach(() => {
            testComponent.value = [];
            testComponent.multiple = true;
            fixture.detectChanges();
        });

        it("shows checkbox on each option", () => {
            click(selectButtonEl);
            fixture.detectChanges();
            fixture.detectChanges();
            const checkbox = de.queryAll(By.css(".option .checkbox"));
            expect(checkbox.length).toBe(5);
        });

        it("checkbox should be ticked if selected", F(async () => {
            testComponent.value = ["opt-2", "opt-5"];
            fixture.detectChanges();
            await fixture.whenStable();
            click(selectButtonEl);
            fixture.detectChanges();
            const checkbox = de.queryAll(By.css(".option .checkbox .fa-check"));
            expect(checkbox.length).toBe(2);
        }));

        it("clicking on an options should select it and keep the dropdown open", () => {
            click(selectButtonEl);
            fixture.detectChanges();

            const options = de.queryAll(By.css(".option"));
            click(options[2]);
            fixture.detectChanges();
            expect(testComponent.value).toEqual(["opt-3"]);

            expect(de.query(By.css(".dropdown"))).not.toBeFalsy();

            click(options[4]);
            fixture.detectChanges();
            expect(testComponent.value).toEqual(["opt-3", "opt-5"]);
        });
    });

    describe("when select allows filtering", () => {
        beforeEach(() => {
            testComponent.filterable = true;
            fixture.detectChanges();
        });

        it("Shoudl show the filter input", () => {
            click(selectButtonEl);
            fixture.detectChanges();
            const inputEl = de.query(By.css("input.select-filter"));
            expect(inputEl).not.toBeFalsy();
        });

        it("Typing in the filter input should filter options", () => {
            click(selectButtonEl);
            fixture.detectChanges();

            const inputEl = de.query(By.css("input.select-filter"));
            updateInput(inputEl, "ta");
            fixture.detectChanges();

            const options = de.queryAll(By.css(".option"));
            expect(options.length).toBe(2);
            expect(options[0].nativeElement.textContent).toContain("Potato");
            expect(options[1].nativeElement.textContent).toContain("Pasta");
        });
    });
});
