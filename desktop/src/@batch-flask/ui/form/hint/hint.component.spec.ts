import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { HintComponent } from "./hint.component";

@Component({
    template: `<bl-hint [align]="align">My foo hint</bl-hint>`,
})
class TestComponent {
    public align: string;
}

describe("HintComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [HintComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-hint"));
        fixture.detectChanges();
    });

    it("show content", () => {
        expect(de.nativeElement.textContent).toContain("My foo hint");
    });

    it("it doesn't align right by default", () => {
        expect(de.classes["bl-align-right"]).toBe(false);
    });

    it("it aligns to the right when asked", () => {
        testComponent.align = "end";
        fixture.detectChanges();
        expect(de.classes["bl-align-right"]).toBe(true);
    });
});
