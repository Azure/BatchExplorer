import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { TableCellComponent } from "./table-cell.component";

@Component({
    template: `
        <bl-cell value="ValueNoContent"></bl-cell>
        <bl-cell>ContentNoValue</bl-cell>
        <bl-cell value="HiddenValue">ContentAndValue</bl-cell>
        <bl-cell [value]="DymamicValue"></bl-cell>
    `,
})
class TestComponent {
    public get DymamicValue() {
        return "I am a dynamic value";
    }
}

describe("TableCellComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let cells: DebugElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [TableCellComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        cells = fixture.debugElement.queryAll(By.css("bl-cell"));
        fixture.detectChanges();
    });

    it("should show value if no content", () => {
        expect(cells[0].nativeElement.textContent).toContain("ValueNoContent");
    });

    it("should show content if no value", () => {
        expect(cells[1].nativeElement.textContent).toContain("ContentNoValue");
    });

    it("should show content if provided even if there is a value", () => {
        expect(cells[2].nativeElement.textContent).toContain("ContentAndValue");
        expect(cells[2].nativeElement.textContent).not.toContain("HiddenValue");
    });

    it("should show value from dynamic call", () => {
        expect(cells[3].nativeElement.textContent).toContain("I am a dynamic value");
    });
});
