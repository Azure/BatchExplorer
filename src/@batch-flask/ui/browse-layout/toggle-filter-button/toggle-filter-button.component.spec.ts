import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { FilterBuilder } from "@batch-flask/core";
import { ClickableComponent } from "@batch-flask/ui/buttons/clickable";

import { click } from "test/utils/helpers";
import { ToggleFilterButtonComponent } from "./toggle-filter-button.component";

@Component({
    template: `<bl-toggle-filter-button [advancedFilter]="filter" (do)="toggle()"></bl-toggle-filter-button>`,
})
class TestComponent {
    public toggle: jasmine.Spy;
    public filter = FilterBuilder.none();
}

describe("ToggleFilterButtonComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [ToggleFilterButtonComponent, ClickableComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        testComponent.toggle = jasmine.createSpy("toggle");
        de = fixture.debugElement.query(By.css("bl-toggle-filter-button"));
        fixture.detectChanges();
    });

    describe("when filter is null", () => {
        beforeEach(() => {
            testComponent.filter = null;
            fixture.detectChanges();
        });

        it("should not show marker", () => {
            expect(de.query(By.css(".filtering"))).toBeFalsy();
        });

        it("should show basic title", () => {
            const clickable = de.query(By.css("bl-clickable")).nativeElement;
            expect(clickable.getAttribute("title")).toEqual("Toggle advanced filter");
        });
    });

    describe("when fitler is empty", () => {
        it("should not show marker", () => {
            expect(de.query(By.css(".filtering"))).toBeFalsy();
        });

        it("should show basic title", () => {
            const clickable = de.query(By.css("bl-clickable")).nativeElement;
            expect(clickable.getAttribute("title")).toEqual("Toggle advanced filter");
        });
    });

    describe("when there is a filter", () => {
        beforeEach(() => {
            testComponent.filter = FilterBuilder.prop("name").eq("some");
            fixture.detectChanges();
        });

        it("should show marker", () => {
            expect(de.query(By.css(".filtering"))).not.toBeFalsy();
        });

        it("should show title with filter", () => {
            const clickable = de.query(By.css("bl-clickable")).nativeElement;
            expect(clickable.getAttribute("title")).toEqual("Toggle advanced filter name eq 'some'");
        });
    });

    it("should call toggle when clicking", () => {
        expect(testComponent.toggle).not.toHaveBeenCalled();
        const clickable = de.query(By.css("bl-clickable"));
        click(clickable);
        expect(testComponent.toggle).toHaveBeenCalledOnce();
    });
});
