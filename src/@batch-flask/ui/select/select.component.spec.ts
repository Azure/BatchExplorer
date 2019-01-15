import { OverlayContainer, OverlayModule } from "@angular/cdk/overlay";
import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, inject } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { ClickableComponent } from "@batch-flask/ui/buttons/clickable";
import { PermissionService } from "@batch-flask/ui/permission";
import { click, mousedown, updateInput } from "test/utils/helpers";
import { SelectOptionComponent } from "./option";
import { OptionTemplateDirective } from "./option-template.directive";
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
class TestComponent {
    public options: any[] = baseOptions;
    public value = new FormControl(null);
    public filterable = false;
    public multiple = false;

    public trackValue(_, value) {
        return value;
    }
}

@Component({
    template: `
        <bl-select placeholder="Myselect" [formControl]="value" [filterable]="filterable" [multiple]="multiple">
            <bl-option
                *ngFor="let option of options; trackBy: trackValue"
                [value]="option.value"
                [label]="option.label"
                [disabled]="option.disabled">

            </bl-option>
        </bl-select>
        <div class="other-nav"tabindex="0">Other nav</div>
    `,
})
class SelectWithLabelComponent extends TestComponent {
}

@Component({
    template: `
        <bl-select placeholder="Myselect" [formControl]="value" [filterable]="filterable" [multiple]="multiple">
            <div *blOptionTemplate="let option">My:{{option.label}}</div>
            <bl-option
                *ngFor="let option of options"
                [item]="option"
                [value]="option.value"
                [label]="option.label"
                [disabled]="option.disabled">
            </bl-option>
        </bl-select>
    `,
})
class SelectWithTemplateComponent extends TestComponent {
}

describe("SelectComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let selectButtonEl: DebugElement;
    let labelEl: DebugElement;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    function setup(component) {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, OverlayModule],
            declarations: [SelectComponent,
                SelectOptionComponent, SelectDropdownComponent,
                OptionTemplateDirective,
                ClickableComponent, component],
            providers: [
                { provide: PermissionService, useValue: null },
            ],
        });
        TestBed.overrideModule(BrowserDynamicTestingModule, {
            set: {
                entryComponents: [SelectDropdownComponent],
            },
        });
        fixture = TestBed.createComponent(component);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-select"));
        selectButtonEl = de.query(By.css(".select-button"));
        fixture.detectChanges();
        labelEl = de.query(By.css(".label"));

        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        })();
    }

    afterEach(() => {
        if (overlayContainer) {
            overlayContainer.ngOnDestroy();
        }
    });

    describe("when using label options", () => {
        beforeEach(() => {
            setup(SelectWithLabelComponent);
        });

        it("Should show placeholder when no value", () => {
            expect(labelEl.nativeElement.textContent).toContain("Myselect");
        });

        it("Should show value when picked", () => {
            testComponent.value.setValue("opt-3");
            fixture.detectChanges();
            expect(labelEl.nativeElement.textContent).toContain("Carrot");
        });

        it("list all options when clicking on button", async () => {
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
        });

        describe("When using object as values", () => {
            const myVal1 = { id: "foo-1" };
            const myVal2 = { id: "foo-2" };

            beforeEach(() => {
                testComponent.options = [
                    { value: myVal1, label: "Value 1" },
                    { value: myVal2, label: "Value 2" },
                ];
                fixture.detectChanges();
            });

            it("returns the value when selecting", async () => {
                click(selectButtonEl);
                fixture.detectChanges();
                await fixture.whenStable();

                const options = overlayContainerElement.querySelectorAll(".option");
                click(options[1]);
                fixture.detectChanges();

                expect(testComponent.value.value).toBe(myVal2);

                const label = de.query(By.css(".label"));
                expect(label.nativeElement.textContent).toContain("Value 2");
            });

            it("returns the value when selecting after it was updated", async () => {

                const val2Clone = { ...myVal2, other: 1 };
                testComponent.options[1].value = val2Clone;
                fixture.detectChanges();
                click(selectButtonEl);
                fixture.detectChanges();
                await fixture.whenStable();

                const options = overlayContainerElement.querySelectorAll(".option");
                click(options[1]);
                fixture.detectChanges();

                expect(testComponent.value.value).toBe(val2Clone);

                expect(labelEl.nativeElement.textContent).toContain("Value 2");
            });
        });

        it("disabled options should have the disabled class", async () => {
            click(selectButtonEl);
            fixture.detectChanges();
            await fixture.whenStable();
            const options = overlayContainerElement.querySelectorAll(".option.disabled");
            expect(options.length).toBe(1);
            expect(options[0].textContent).toContain("Pasta");
        });

        it("clicking on an options should select it and close dropdown", async () => {
            click(selectButtonEl);
            fixture.detectChanges();
            await fixture.whenStable();

            const options = overlayContainerElement.querySelectorAll(".option");
            click(options[2]);
            fixture.detectChanges();

            expect(testComponent.value.value).toBe("opt-3");

            expect(overlayContainerElement.querySelector("bl-select-dropdown")).toBeFalsy();
        });

        it("clicking on disabled options should not do anything", async () => {
            click(selectButtonEl);
            fixture.detectChanges();
            await fixture.whenStable();

            const options = overlayContainerElement.querySelectorAll(".option");
            click(options[3]);
            fixture.detectChanges();

            expect(testComponent.value.value).toBe(null);

            expect(overlayContainerElement.querySelector("bl-select-dropdown")).not.toBeFalsy();
        });

        it("should show selected option when it is set with delay", async () => {
            fixture = TestBed.createComponent(SelectWithLabelComponent);
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

        it("should close the dropdown when focusing out of the select", async () => {
            selectButtonEl.nativeElement.focus();
            click(selectButtonEl);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(overlayContainerElement.querySelector("bl-select-dropdown")).not.toBeFalsy();

            fixture.debugElement.query(By.css(".other-nav")).nativeElement.focus();
            expect(overlayContainerElement.querySelector("bl-select-dropdown")).toBeFalsy();
        });

        describe("when select allows multiple values", () => {
            beforeEach(() => {
                testComponent.value.setValue([]);
                testComponent.multiple = true;
                fixture.detectChanges();
            });

            it("shows checkbox on each option", async () => {
                click(selectButtonEl);
                fixture.detectChanges();
                fixture.detectChanges();
                await fixture.whenStable();
                const checkbox = overlayContainerElement.querySelectorAll(".option .checkbox");
                expect(checkbox.length).toBe(6);
            });

            it("checkbox should be ticked if selected", async () => {
                testComponent.value.setValue(["opt-2", "opt-5"]);
                fixture.detectChanges();
                await fixture.whenStable();

                click(selectButtonEl);
                fixture.detectChanges();
                const checkbox = overlayContainerElement.querySelectorAll(".option .checkbox .fa-check");
                expect(checkbox.length).toBe(2);
            });

            it("clicking on an options should select it and keep the dropdown open", async () => {
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
            });

            it("clicking on an options shouldn't take focus away from button", async () => {
                selectButtonEl.nativeElement.focus();
                click(selectButtonEl);
                fixture.detectChanges();
                await fixture.whenStable();

                const options = overlayContainerElement.querySelectorAll(".option");
                expect(document.activeElement).toEqual(selectButtonEl.nativeElement);
                const event = mousedown(options[3]);
                fixture.detectChanges();
                expect(testComponent.value.value).toEqual(["opt-3"]);
                expect(document.activeElement).toEqual(selectButtonEl.nativeElement);
                expect(event.defaultPrevented);
            });
        });

        describe("when select allows filtering", () => {
            beforeEach(() => {
                testComponent.filterable = true;
                fixture.detectChanges();
            });

            it("Should show the filter input", () => {
                click(selectButtonEl);
                fixture.detectChanges();
                const inputEl = de.query(By.css("input.select-filter"));
                expect(inputEl).not.toBeFalsy();
            });

            it("Typing in the filter input should filter options", async () => {
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
            });

            it("should close the dropdown when focusing out of the select", async () => {
                click(selectButtonEl);
                fixture.detectChanges();
                await fixture.whenStable();

                const inputEl = de.query(By.css("input.select-filter"));
                expect(document.activeElement).toEqual(inputEl.nativeElement);
                expect(overlayContainerElement.querySelector("bl-select-dropdown")).not.toBeFalsy();

                fixture.debugElement.query(By.css(".other-nav")).nativeElement.focus();
                expect(document.activeElement).not.toEqual(inputEl.nativeElement);

                expect(overlayContainerElement.querySelector("bl-select-dropdown")).toBeFalsy();
            });
        });
    });

    describe("when using template options", () => {
        beforeEach(() => {
            setup(SelectWithTemplateComponent);
        });

        it("Should show placeholder when no value", () => {
            expect(labelEl.nativeElement.textContent).toContain("Myselect");
        });

        it("Should show value when picked", () => {
            testComponent.value.setValue("opt-3");
            fixture.detectChanges();
            expect(labelEl.nativeElement.textContent).toContain("My:Carrot");
        });

        it("list all options when clicking on button", async () => {
            click(selectButtonEl);
            fixture.detectChanges();
            await fixture.whenStable();
            expect(overlayContainerElement.querySelector("bl-select-dropdown")).not.toBeFalsy();
            const options = overlayContainerElement.querySelectorAll(".option");
            expect(options.length).toBe(5);
            expect(options[0].textContent).toContain("My:Potato");
            expect(options[1].textContent).toContain("My:Banana");
            expect(options[2].textContent).toContain("My:Carrot");
            expect(options[3].textContent).toContain("My:Pasta");
            expect(options[4].textContent).toContain("My:Rice");
        });
    });
});
