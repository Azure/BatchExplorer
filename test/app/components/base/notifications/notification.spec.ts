import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { List } from "immutable";

import {
    Notification,
    NotificationContainerComponent,
    NotificationLevel,
    NotificationManager,
    NotificationModule,
} from "app/components/base/notifications";

@Component({
    template: `<bex-notification-container></bex-notification-container>`,
})
class FakeAppComponent {

}

describe("Notification", () => {
    let notificationManager: NotificationManager;
    let currentNotifications: List<Notification>;
    let fixture: ComponentFixture<FakeAppComponent>;
    let de: DebugElement;
    let notificationContainer: NotificationContainerComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NotificationModule],
            declarations: [FakeAppComponent],
        });
        notificationManager = TestBed.get(NotificationManager);
        notificationManager.notifications.subscribe((x) => currentNotifications = x);
        fixture = TestBed.createComponent(FakeAppComponent);
        de = fixture.debugElement;

        notificationContainer = de.query(By.css("bex-notification-container")).componentInstance;
    });

    it("Should not have any notifications to start with", () => {
        expect(currentNotifications.size).toBe(0);
        expect(de.query(By.css("bex-notification"))).toBeNull();
    });

    describe("when a notification is sent", () => {
        beforeEach(() => {
            notificationManager.notify(NotificationLevel.success, "FakeNotification", "Something happend!", {
                autoDismiss: 3,
            });
            fixture.detectChanges();
        });

        it("should add a notification to the list", () => {
            expect(currentNotifications.size).toBe(1);
            const notification = currentNotifications.first();
            expect(notification.level).toEqual(NotificationLevel.success);
            expect(notification.title).toEqual("FakeNotification");
            expect(notification.message).toEqual("Something happend!");
            expect(notification.config.autoDismiss).toBe(3);
        });

        it("notificationContainer should display the notification", () => {
            const notificationEl = de.query(By.css("bex-notification"));
            expect(notificationEl).not.toBeNull();

            expect(notificationEl.nativeElement.classList).toContain(NotificationLevel.success);
            expect(notificationEl.nativeElement.classList).not.toContain(NotificationLevel.error);
            expect(notificationEl.nativeElement.classList).not.toContain(NotificationLevel.info);

            const titleEl = notificationEl.query(By.css(".notification-title"));
            const messageEl = notificationEl.query(By.css(".notification-message"));
            expect(titleEl.nativeElement.textContent).toContain("FakeNotification");
            expect(messageEl.nativeElement.textContent).toContain("Something happend!");
        });

        it("should dismiss automatically after 3s", (done) => {
            expect(currentNotifications.size).not.toBe(0);
            setTimeout(() => {
                fixture.detectChanges();
                expect(currentNotifications.size).toBe(0);
                expect(de.query(By.css("bex-notification"))).toBeNull();
                done();
            }, 3000);
        });

        it("clicking dimiss should dismiss", () => {
            const notificationBtn = de.query(By.css("bex-notification .dismiss-btn"));
            notificationBtn.nativeElement.click();
            fixture.detectChanges();
            expect(currentNotifications.size).toBe(0);
            expect(de.query(By.css("bex-notification"))).toBeNull();
        });
    });

    describe("Calling helper functions", () => {
        it("calling success should show a success notification", () => {
            notificationManager.success("FakeNotification", "Something great happend!");
            expect(currentNotifications.size).toBe(1);
            const notification = currentNotifications.first();
            expect(notification.level).toEqual(NotificationLevel.success);
            expect(notification.title).toEqual("FakeNotification");
            expect(notification.message).toEqual("Something great happend!");
        });

        it("calling error should show a error notification", () => {
            notificationManager.error("FakeNotification", "Something bad happend!");
            expect(currentNotifications.size).toBe(1);
            const notification = currentNotifications.first();
            expect(notification.level).toEqual(NotificationLevel.error);
            expect(notification.title).toEqual("FakeNotification");
            expect(notification.message).toEqual("Something bad happend!");
        });

        it("calling info should show a error notification", () => {
            notificationManager.info("FakeNotification", "Something happend!");
            expect(currentNotifications.size).toBe(1);
            const notification = currentNotifications.first();
            expect(notification.level).toEqual(NotificationLevel.info);
            expect(notification.title).toEqual("FakeNotification");
            expect(notification.message).toEqual("Something happend!");
        });
    });
});
