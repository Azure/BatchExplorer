import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "@batch-flask/core";
import { ButtonComponent } from "@batch-flask/ui/buttons/button.component";
import { PermissionService } from "@batch-flask/ui/permission";
import { click } from "test/utils/helpers";
import { runAxe } from "test/utils/helpers/axe-helpers";

@Component({
    template: `
        <bl-button [disabled]="disabled" icon="fa fa-stop" [action]="onAction" title="Stop" [color]="color"
            [type]="type">
        </bl-button>
    `,
})
class TestComponent {
    public type = "square";
    public disabled: boolean = false;

    public onAction: jasmine.Spy;

    public color = "primary";
    constructor() {
        this.onAction = jasmine.createSpy("onAction");
    }
}

fdescribe("ButtonComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule, NoopAnimationsModule],
            declarations: [ButtonComponent, TestComponent],
            providers: [
                { provide: PermissionService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-button"));
        fixture.detectChanges();
    });

    it("should have the icon specified", () => {
        const icon = de.query(By.css("i.fa.fa-stop"));
        expect(icon).not.toBeFalsy();
    });

    it("Should have the tooltip specified with title", () => {
        const el = de.query(By.css(".action-btn"));
        expect(el.nativeElement.title).toBe("Stop");
    });

    it("should change color", () => {
        expect(de.attributes["color"]).toBe("primary");

        testComponent.color = "warn";
        fixture.detectChanges();
        expect(de.attributes["color"]).toBe("warn");
    });

    it("works when action returns null", () => {
        testComponent.onAction.and.returnValue(null);
        click(de);
        fixture.detectChanges();
        expect(testComponent.onAction).toHaveBeenCalledOnce();
        expect(de.query(By.css(".fa-check"))).not.toBeFalsy();
    });

    it("works when action returns a non observable", () => {
        testComponent.onAction.and.returnValue("some-string");
        click(de);
        fixture.detectChanges();
        expect(testComponent.onAction).toHaveBeenCalledOnce();
        expect(de.query(By.css(".fa-check"))).not.toBeFalsy();
    });

    it("set aria-describedby by with title only if not using an icon button", () => {
        testComponent.type = "wide";
        fixture.detectChanges();
        const describedbyId = de.attributes["aria-describedby"].split(" ")[0];
        const describedby = de.query(By.css(`#${describedbyId}`));
        expect(describedby).not.toBeFalsy();
        expect(describedby.nativeElement.textContent).toContain("Stop");
    });

    it("doesn't set aria-describedby by with title if using an icon button", () => {
        testComponent.type = "square";
        fixture.detectChanges();

        const describedbyId = de.attributes["aria-describedby"];
        expect(describedbyId).toBeBlank();
    });

    fit("should pass accessibility test", async () => {
        expect(await runAxe(fixture.nativeElement)).toHaveNoViolations();
        // , { rules:{ "aria-command-name":{ enabled:false } } }
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
