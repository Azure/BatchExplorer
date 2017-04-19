import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { TableCellComponent } from "app/components/base/table";

@Component({
    template: `
        <bl-cell value="ValueNoContent"></bl-cell>
        <bl-cell>ContentNoValue</bl-cell>
        <bl-cell value="HiddenValue">ContentAndValue</bl-cell>
    `,
})
class TestComponent {
}

describe("TableCellComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let cells: DebugElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [TableCellComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
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
});
