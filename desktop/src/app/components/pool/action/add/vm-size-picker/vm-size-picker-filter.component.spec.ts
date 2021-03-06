import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import { SelectComponent, SelectModule } from "@batch-flask/ui";
import { VmSizePickerFilterComponent } from "app/components/pool/action/add";
import { updateInput } from "test/utils/helpers";

@Component({
    template: `<bl-vm-size-picker-filter [categoriesDisplayName]="categoriesDisplayName"
        (filterChange)="onFilterChange($event)"></bl-vm-size-picker-filter>`,
})
class TestComponent {
    public categoriesDisplayName: {[key: string]: string} = {
        all: "All",
        standard: "Standard",
        computed: "Computed optimized",
        memory: "Memory optimized",
    };
    public onFilterChange = jasmine.createSpy("onFilterChange");
}

describe("VmSizePickerFilterComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule, FormsModule, SelectModule, ReactiveFormsModule],
            declarations: [VmSizePickerFilterComponent, TestComponent],
            providers: [
                { provide: FormBuilder, useValue: new FormBuilder() },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-vm-size-picker-filter"));
        fixture.detectChanges();
    });

    it("should have correct categories properties display in selector", () => {
        const select: SelectComponent = de.query(By.css("bl-select")).componentInstance;
        expect(select.options.toArray()[0].label).toEqual("All");
        expect(select.options.toArray()[1].label).toEqual("Computed optimized");
        expect(select.options.toArray()[2].label).toEqual("Memory optimized");
        expect(select.options.toArray()[3].label).toEqual("Standard");
    });

    it("should have trigger event emitter when select a category", () => {
        const select: SelectComponent = de.query(By.css("bl-select")).componentInstance;
        select.selectOption(select.options.toArray()[1]); // Computed optimized
        fixture.detectChanges();
        expect(testComponent.onFilterChange).toHaveBeenCalled();
        expect(testComponent.onFilterChange).toHaveBeenCalledWith({ category: "computed", searchName: null });
    });

    it("should have trigger event emitter when search 'v2' in all category", () => {
        const inputEl = de.query(By.css("input"));
        updateInput(inputEl, "v2");
        expect(testComponent.onFilterChange).toHaveBeenCalled();
        expect(testComponent.onFilterChange).toHaveBeenCalledWith({ category: "all", searchName: "v2" });
    });
});
