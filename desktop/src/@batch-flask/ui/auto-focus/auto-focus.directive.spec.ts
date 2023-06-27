import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { AutoFocusDirective } from "./auto-focus.directive";

@Component({
    template: `<input autofocus>`,
})
class TestComponent {
}

describe("AutoFocusDirective", () => {
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [AutoFocusDirective, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
    });

    it("autofocus the input", () => {
        expect(document.activeElement).toEqual(fixture.debugElement.query(By.css("input")).nativeElement);
    });
});
