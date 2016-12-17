import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { TextPropertyComponent } from "app/components/base/property-list";
import { mouseenter, mouseleave } from "test/utils/helpers";

describe("TextPropertyComponent", () => {
    let fixture: ComponentFixture<TextPropertyComponent>;
    let de: DebugElement;
    let component: TextPropertyComponent;
    let section: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TextPropertyComponent],
        });
        fixture = TestBed.createComponent(TextPropertyComponent);
        de = fixture.debugElement;
        component = fixture.componentInstance;
        section = de.query(By.css("section"));
        fixture.detectChanges();
    });

    it("Should show the label and the value", () => {
        component.label = "State";
        component.value = "Running";
        fixture.detectChanges();
        const label = de.query(By.css("label"));
        const value = de.query(By.css(".value"));

        expect(label).not.toBeNull();
        expect(value).not.toBeNull();

        expect(label.nativeElement.textContent).toContain("State");
        expect(value.nativeElement.textContent).toContain("Running");
    });

    it("the clipboard should be enabled by default", () => {
        const clipboard = de.query(By.css(".clipboard"));
        expect(clipboard).not.toBeNull();
        expect(clipboard).toBeHidden();
    });

    it("Should show the clipboard when mouse enter and hide when mouse leave", () => {
        mouseenter(section);
        fixture.detectChanges();
        const clipboard = de.query(By.css(".clipboard"));
        expect(clipboard).toBeVisible();

        mouseleave(section);
        fixture.detectChanges();
        expect(clipboard).toBeHidden();
    });

    describe("when clipboard is disabled", () => {
        beforeEach(() => {
            component.copyable = false;
            fixture.detectChanges();
        });

        it("should not have the clipboard element", () => {
            const clipboard = de.query(By.css(".clipboard"));
            expect(clipboard).toBeNull();
        });

        it("should not show the clipboard on mouseover", () => {
            mouseenter(section);
            fixture.detectChanges();

            const clipboard = de.query(By.css(".clipboard"));
            expect(clipboard).toBeNull();
        });
    });
});
