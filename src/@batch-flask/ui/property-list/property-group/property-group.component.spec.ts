import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { ButtonComponent, ClickableComponent } from "@batch-flask/ui/buttons";
import { PropertyGroupComponent } from "@batch-flask/ui/property-list";
import { click } from "test/utils/helpers";

@Component({
    template: `
        <bl-property-group label="Main group" [collapsed]="collapsed" [warningMessage]="warningMessage">
            <div collapsed-preview>Preview of content</div>
            Some content
        </bl-property-group>
    `,
})
class TestGroupComponent {
    public collapsed = false;
    public warningMessage = null;
}

describe("PropertyGroupComponent", () => {
    let fixture: ComponentFixture<TestGroupComponent>;
    let de: DebugElement;
    let component: TestGroupComponent;
    let header: DebugElement;
    let group: PropertyGroupComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestGroupComponent, PropertyGroupComponent, ButtonComponent, ClickableComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestGroupComponent);
        de = fixture.debugElement;
        component = fixture.componentInstance;
        fixture.detectChanges();
        header = de.query(By.css(".group-header"));
        group = de.query(By.css("bl-property-group")).componentInstance;
    });

    it("Should show the group title", () => {
        expect(header.nativeElement.textContent).toContain("Main group");
    });

    it("Should not show the collapsed preview", () => {
        expect(header.nativeElement.textContent).not.toContain("Preview of content");
    });

    it("Should show the content of the group", () => {
        const content = de.query(By.css(".group-content"));
        expect(content).not.toBeNull();
        expect(header.nativeElement.textContent).not.toContain("Preview of content");
    });

    it("should not show the warning message", () => {
        const message = de.query(By.css(".group-content .warning-message"));
        expect(message).toBeNull();
    });

    it("click on the header should collapse the group", () => {
        click(header);
        fixture.detectChanges();
        expect(group.collapsed).toBe(true);
    });

    it("should show the warning message when present", () => {
        component.warningMessage = "Some warning";
        fixture.detectChanges();
        const message = de.query(By.css(".warning-message"));
        expect(message).not.toBeNull();
        expect(message.nativeElement.textContent).toContain("Some warning");
    });

    it("should have aria-expanded true on the header", () => {
        expect(header.attributes["aria-expanded"]).toEqual("true");
    });

    it("has the aria controls attributes", () => {
        const content = de.query(By.css(".group-content"));

        expect(header.attributes["aria-controls"]).not.toBeFalsy();
        expect(header.attributes["aria-controls"]).toEqual(content.nativeElement.id);
    });

    describe("when group is collapsed", () => {
        beforeEach(() => {
            component.collapsed = true;
            fixture.detectChanges();
        });

        it("should show preview content", () => {
            expect(header.nativeElement.textContent).toContain("Preview of content");
        });

        it("should have aria-expanded false on the header", () => {
            expect(header.attributes["aria-expanded"]).toEqual("false");
        });

        it("should not show the group content", () => {
            const content = de.query(By.css(".group-content"));
            expect(content).toBeNull();
        });
    });
});
