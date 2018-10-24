import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { AutoFocusDirective } from "./auto-focus.directive";

@Component({
    template: `<input autofocus></bl-auto-focus>`,
})
class TestComponent {
}

describe("AutoFocusDirective", () => {
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [AutoFocusDirective, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-auto-focus"));
        fixture.detectChanges();
    });

    it("autofocus the input", () => {
        expect(document.activeElement).toEqual(de.query(By.css("input")).nativeElement);
    });
});
