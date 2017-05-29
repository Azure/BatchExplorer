import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { ActionButtonComponent } from "app/components/base/buttons/action-button.component";

@Component({
    template: `
        <bl-action-btn [disabled]="disabled" icon="fa fa-stop" (action)="onAction()"></bl-action-btn>
    `,
})
class TestComponent {
    public disabled: boolean = false;

    public onAction: jasmine.Spy;

    constructor() {
        this.onAction = jasmine.createSpy("onAction");
    }
}

fdescribe("ActionButton", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: ActionButtonComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [ActionButtonComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-action-btn"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    describe("when disabled", () => {
        beforeEach(() => {
            testComponent.disabled = true;
            fixture.detectChanges();
        });

        it("should have the disabled class", () => {
            expect(de.classes["disabled"]).toBe(true);
        });
    });
});
