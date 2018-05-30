import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, inject } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { OverlayContainer, OverlayModule } from "@angular/cdk/overlay";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { ClickableComponent } from "@batch-flask/ui/buttons/clickable";
import { PermissionService } from "@batch-flask/ui/permission";
import { F } from "test/utils";
import { click, updateInput } from "test/utils/helpers";
import { SelectOptionComponent } from "./option";
import { SelectDropdownComponent } from "./select-dropdown";
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
        <bl-select placeholder="Myselect" [formControl]="value" [filterable]="filterable" [multiple]="multiple">
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
    public value = new FormControl(null);
    public filterable = false;
    public multiple = false;
}

describe("SelectComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let selectButtonEl: DebugElement;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, OverlayModule],
            declarations: [SelectComponent,
                SelectOptionComponent, SelectDropdownComponent,
                ClickableComponent, TestComponent],
            providers: [
                { provide: PermissionService, useValue: null },
            ],
        });
        TestBed.overrideModule(BrowserDynamicTestingModule, {
            set: {
                entryComponents: [SelectDropdownComponent],
            },
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-select"));
        selectButtonEl = de.query(By.css(".select-button"));
        fixture.detectChanges();

        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        })();
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    it("Should show placeholder when no value", () => {
        expect(de.nativeElement.textContent).toContain("Myselect");
    });

    it("Should show value when picked", () => {
        testComponent.value.setValue("opt-3");
        fixture.detectChanges();
        expect(de.nativeElement.textContent).toContain("Carrot");
    });

    it("list all options when clicking on button", F(async () => {
        click(selectButtonEl);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(overlayContainerElement.querySelector("bl-select-dropdown")).not.toBeFalsy();
        const options = overlayContainerElement.querySelectorAll(".option");
        expect(options.length).toBe(5);
        expect(options[0].textContent).toContain("Potato");
        expect(options[1].textContent).toContain("Banana");
        expect(options[2].textContent).toContain("Carrot");
        expect(options[3].textContent).toContain("Pasta");
        expect(options[4].textContent).toContain("Rice");
    }));

    it("disabled options should have the disabled class", F(async () => {
        click(selectButtonEl);
        fixture.detectChanges();
        await fixture.whenStable();
        const options = overlayContainerElement.querySelectorAll(".option.disabled");
        expect(options.length).toBe(1);
        expect(options[0].textContent).toContain("Pasta");
    }));

    it("clicking on an options should select it and close dropdown", F(async () => {
        click(selectButtonEl);
        fixture.detectChanges();
        await fixture.whenStable();

        const options = overlayContainerElement.querySelectorAll(".option");
        click(options[2]);
        fixture.detectChanges();

        expect(testComponent.value.value).toBe("opt-3");

        expect(overlayContainerElement.querySelector("bl-select-dropdown")).toBeFalsy();
    }));

    it("clicking on disabled options should not do anything", F(async () => {
        click(selectButtonEl);
        fixture.detectChanges();
        await fixture.whenStable();

        const options = overlayContainerElement.querySelectorAll(".option");
        click(options[3]);
        fixture.detectChanges();

        expect(testComponent.value.value).toBe(null);

        expect(overlayContainerElement.querySelector("bl-select-dropdown")).not.toBeFalsy();
    }));

    it("should show selected option when it is set with delay", async () => {
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-select"));

        // Remove options
        testComponent.options = [];
        // Set value
        testComponent.value.setValue("opt-2");
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(de.nativeElement.textContent).not.toContain("Myselect");

        testComponent.options = baseOptions;
        fixture.detectChanges();

        expect(de.nativeElement.textContent).not.toContain("Myselect");
        expect(de.nativeElement.textContent).toContain("Banana");
    });

    describe("when select allows multiple values", () => {
        beforeEach(() => {
            testComponent.value.setValue([]);
            testComponent.multiple = true;
            fixture.detectChanges();
        });

        it("shows checkbox on each option", F(async () => {
            click(selectButtonEl);
            fixture.detectChanges();
            fixture.detectChanges();
            await fixture.whenStable();
            const checkbox = overlayContainerElement.querySelectorAll(".option .checkbox");
            expect(checkbox.length).toBe(6);
        }));

        it("checkbox should be ticked if selected", F(async () => {
            testComponent.value.setValue(["opt-2", "opt-5"]);
            fixture.detectChanges();
            await fixture.whenStable();

            click(selectButtonEl);
            fixture.detectChanges();
            const checkbox = overlayContainerElement.querySelectorAll(".option .checkbox .fa-check");
            expect(checkbox.length).toBe(2);
        }));

        it("clicking on an options should select it and keep the dropdown open", F(async () => {
            click(selectButtonEl);
            fixture.detectChanges();
            await fixture.whenStable();

            const options = overlayContainerElement.querySelectorAll(".option");
            click(options[3]);
            fixture.detectChanges();
            expect(testComponent.value.value).toEqual(["opt-3"]);

            expect(overlayContainerElement.querySelector("bl-select-dropdown")).not.toBeFalsy();

            click(options[5]);
            fixture.detectChanges();
            expect(testComponent.value.value).toEqual(["opt-3", "opt-5"]);
        }));
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

        it("Typing in the filter input should filter options", F(async () => {
            click(selectButtonEl);
            fixture.detectChanges();
            await fixture.whenStable();

            const inputEl = de.query(By.css("input.select-filter"));
            updateInput(inputEl, "ta");
            fixture.detectChanges();

            const options = overlayContainerElement.querySelectorAll(".option");
            expect(options.length).toBe(2);
            expect(options[0].textContent).toContain("Potato");
            expect(options[1].textContent).toContain("Pasta");
        }));
    });
});
