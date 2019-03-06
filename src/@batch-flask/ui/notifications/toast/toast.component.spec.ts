import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { MouseButton } from "@batch-flask/core";
import { ClickableComponent } from "@batch-flask/ui/buttons";
import { Notification, NotificationLevel, NotificationService } from "@batch-flask/ui/notifications";
import { click, mouseenter, mouseleave, mouseup } from "test/utils/helpers";
import { ToastComponent } from "./toast.component";

@Component({
    template: `<bl-toast [notification]="notification"></bl-toast>`,
})
class TestComponent {
    public notification = new Notification(NotificationLevel.info, "My info", "With message");
}

describe("ToastComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let notificationServiceSpy;

    beforeEach(() => {
        notificationServiceSpy = {
            dismiss: jasmine.createSpy("notificationService.dismiss"),
            pauseAutoDimiss: jasmine.createSpy("notificationService.pauseAutoDimiss"),
            resumeAutoDimiss: jasmine.createSpy("notificationService.resumeAutoDimiss"),
        };

        TestBed.configureTestingModule({
            imports: [],
            declarations: [ToastComponent, ClickableComponent, TestComponent],
            providers: [
                { provide: NotificationService, useValue: notificationServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-toast"));
        fixture.detectChanges();
    });

    it("shows the title", () => {
        expect(de.nativeElement.textContent).toContain("My info");
    });

    it("shows the message", () => {
        expect(de.nativeElement.textContent).toContain("With message");
    });

    it("shows the dismiss button", () => {
        expect(de.query(By.css(".dismiss-btn"))).not.toBeFalsy();
    });

    it("pause auto dismiss when mouse enter", () => {
        mouseenter(de);
        expect(notificationServiceSpy.pauseAutoDimiss).toHaveBeenCalledOnce();
        expect(notificationServiceSpy.pauseAutoDimiss).toHaveBeenCalledWith(testComponent.notification);
    });

    it("resume auto dismiss when mouse enter", () => {
        mouseleave(de);
        expect(notificationServiceSpy.resumeAutoDimiss).toHaveBeenCalledOnce();
        expect(notificationServiceSpy.resumeAutoDimiss).toHaveBeenCalledWith(testComponent.notification);
    });
    describe("when notification has actions", () => {
        let mainAction: jasmine.Spy;
        let secondaryAction1: jasmine.Spy;
        let secondaryAction2: jasmine.Spy;

        beforeEach(() => {
            mainAction = jasmine.createSpy("mainAction");
            secondaryAction1 = jasmine.createSpy("mainAction");
            secondaryAction2 = jasmine.createSpy("mainAction");

            testComponent.notification = new Notification(NotificationLevel.info, "My action", "Do something", {
                action: mainAction,
                actions: [
                    { name: "Action 1", do: secondaryAction1 },
                    { name: "Action 2", do: secondaryAction2 },
                ],
            });
            fixture.detectChanges();
        });

        it("shows the secondary actions", () => {
            const actions = de.queryAll(By.css(".action"));
            expect(actions.length).toBe(2);
            expect(actions[0].nativeElement.textContent).toContain("Action 1");
            expect(actions[1].nativeElement.textContent).toContain("Action 2");
        });

        it("clicking on dismiss button doesn't call any of the actions", () => {
            const dismissBtn = de.query(By.css(".dismiss-btn"));
            expect(dismissBtn).not.toBeFalsy();
            click(dismissBtn);
            fixture.detectChanges();

            expect(notificationServiceSpy.dismiss).toHaveBeenCalledOnce();
            expect(notificationServiceSpy.dismiss).toHaveBeenCalledWith(testComponent.notification);

            expect(mainAction).not.toHaveBeenCalled();
            expect(secondaryAction1).not.toHaveBeenCalled();
            expect(secondaryAction2).not.toHaveBeenCalled();
        });

        it("middle click dismiss and doesn't call any of the actions", () => {
            mouseup(de, MouseButton.middle);
            fixture.detectChanges();

            expect(notificationServiceSpy.dismiss).toHaveBeenCalledOnce();
            expect(notificationServiceSpy.dismiss).toHaveBeenCalledWith(testComponent.notification);

            expect(mainAction).not.toHaveBeenCalled();
            expect(secondaryAction1).not.toHaveBeenCalled();
            expect(secondaryAction2).not.toHaveBeenCalled();
        });

        it("clicking on one of the secondary action calls it but not the main", () => {
            const actions = de.queryAll(By.css(".action"));

            click(actions[0]);
            fixture.detectChanges();
            expect(mainAction).not.toHaveBeenCalled();
            expect(secondaryAction1).toHaveBeenCalledOnce();
            expect(secondaryAction2).not.toHaveBeenCalled();
        });

        it("clicking on toast trigger main action", () => {
            click(de);
            fixture.detectChanges();
            expect(mainAction).toHaveBeenCalledOnce();
            expect(secondaryAction1).not.toHaveBeenCalled();
            expect(secondaryAction2).not.toHaveBeenCalled();
        });
    });
});
