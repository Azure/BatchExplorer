import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { MaterialModule, MdTooltip } from "@angular/material";
import { ActionButtonComponent } from "app/components/base/buttons/action-button.component";
import { click } from "test/utils/helpers";

@Component({
    template: `
        <bl-action-btn [disabled]="disabled" icon="fa fa-stop" (action)="onAction()" title="Stop" [color]="color">
        </bl-action-btn>
    `,
})
class TestComponent {
    public disabled: boolean = false;

    public onAction: jasmine.Spy;

    public color = "primary";
    constructor() {
        this.onAction = jasmine.createSpy("onAction");
    }
}

describe("ActionButton", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: ActionButtonComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule],
            declarations: [ActionButtonComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-action-btn"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("should have the icon specified", () => {
        const icon = de.query(By.css("i.fa.fa-stop"));
        expect(icon).not.toBeFalsy();
    });

    it("Should have the tooltip specified with title", () => {
        const el = de.query(By.css(".action-btn"));
        const tooltip = el.injector.get(MdTooltip);
        expect(tooltip.message).toBe("Stop");
    });

    it("should change color", () => {
        expect(de.attributes["color"]).toBe("primary");

        testComponent.color = "warn";
        fixture.detectChanges();
        expect(de.attributes["color"]).toBe("warn");

    });

    describe("when disabled", () => {
        beforeEach(() => {
            testComponent.disabled = true;
            fixture.detectChanges();
        });

        it("should have the disabled class", () => {
            expect(de.classes["disabled"]).toBe(true);
        });

        it("should not trigger the event on click", () => {
            click(de);
            fixture.detectChanges();
            expect(testComponent.onAction).not.toHaveBeenCalled();
        });
    });

    describe("when enabled", () => {
        beforeEach(() => {
            testComponent.disabled = false;
            fixture.detectChanges();
        });

        it("should have NOT the disabled class", () => {
            expect(de.classes["disabled"]).toBe(false);
        });

        it("should trigger the event on click", () => {
            click(de);
            fixture.detectChanges();
            expect(testComponent.onAction).toHaveBeenCalledOnce();
        });
    });
});
