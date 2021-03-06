import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { TextPropertyComponent } from "./text-property.component";

@Component({
    template: `
        <bl-text-property [label]="label" [value]="value" [copyable]="copyable">
        </bl-text-property>
    `,
})
class TestComponent {
    public label: string;
    public value: string;
    public copyable: boolean = true;
}

describe("TextPropertyComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;
    let testComponent: TestComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestComponent, TextPropertyComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement;
        testComponent = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("Should show the label and the value", () => {
        testComponent.label = "State";
        testComponent.value = "Running";
        fixture.detectChanges();
        const label = de.query(By.css("[propertyLabel]"));
        const value = de.query(By.css("bl-property-content"));

        expect(label).not.toBeNull();
        expect(value).not.toBeNull();

        expect(label.nativeElement.textContent).toContain("State");
        expect(value.nativeElement.textContent).toContain("Running");
    });
});
