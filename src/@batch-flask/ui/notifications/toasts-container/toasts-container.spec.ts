import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { List } from "immutable";

import {
    Notification,
    NotificationLevel,
    NotificationModule,
    NotificationService,
} from "@batch-flask/ui/notifications";
import { PermissionService } from "@batch-flask/ui/permission";

@Component({
    template: `<bl-toasts-container></bl-toasts-container>`,
})
class FakeAppComponent {

}

describe("Notification", () => {
    let notificationService: NotificationService;
    let currentNotifications: List<Notification>;
    let currentPersistedNotifications: List<Notification>;
    let fixture: ComponentFixture<FakeAppComponent>;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NotificationModule],
            declarations: [FakeAppComponent],
            providers: [
                { provide: PermissionService, useValue: null },
            ],
        });
        notificationService = TestBed.get(NotificationService);
        notificationService.notifications.subscribe((x) => currentNotifications = x);
        notificationService.persistedNotifications.subscribe((x) => currentPersistedNotifications = x);
        fixture = TestBed.createComponent(FakeAppComponent);
        de = fixture.debugElement;
    });

    it("Should not have any notifications to start with", () => {
        expect(currentNotifications.size).toBe(0);
        expect(de.query(By.css("bl-toast"))).toBeNull();
    });

    describe("when a notification is sent", () => {
        beforeEach(() => {
            notificationService.notify(NotificationLevel.success, "FakeNotification", "Something happend!", {
                autoDismiss: 1000,
            });
            fixture.detectChanges();
        });

        it("should add a notification to the list", () => {
            expect(currentNotifications.size).toBe(1);
            const notification = currentNotifications.first();
            expect(notification.level).toEqual(NotificationLevel.success);
            expect(notification.title).toEqual("FakeNotification");
            expect(notification.message).toEqual("Something happend!");
            expect(notification.config.autoDismiss).toBe(1000);
        });

        it("notificationContainer should display the notification", () => {
            const notificationEl = de.query(By.css("bl-toast"));
            expect(notificationEl).not.toBeNull();

            expect(notificationEl.nativeElement.classList).toContain(NotificationLevel.success);
            expect(notificationEl.nativeElement.classList).not.toContain(NotificationLevel.error);
            expect(notificationEl.nativeElement.classList).not.toContain(NotificationLevel.info);

            const titleEl = notificationEl.query(By.css(".notification-title"));
            const messageEl = notificationEl.query(By.css(".notification-message"));
            expect(titleEl.nativeElement.textContent).toContain("FakeNotification");
            expect(messageEl.nativeElement.textContent).toContain("Something happend!");
        });

        it("should dismiss automatically after 1s", (done) => {
            expect(currentNotifications.size).not.toBe(0);
            setTimeout(() => {
                fixture.detectChanges();
                expect(currentNotifications.size).toBe(0);
                expect(de.query(By.css("bl-toast"))).toBeNull();
                done();
            }, 1000);
        });

        it("clicking dimiss should dismiss", () => {
            const notificationBtn = de.query(By.css("bl-toast .dismiss-btn"));
            notificationBtn.nativeElement.click();
            fixture.detectChanges();
            expect(currentNotifications.size).toBe(0);
            expect(de.query(By.css("bl-toast"))).toBeNull();
        });
    });

    describe("when a persistent notification is sent", () => {
        beforeEach(() => {
            notificationService.notify(NotificationLevel.success, "FakePersistentNotification", "Something happend!", {
                autoDismiss: 1000,
                persist: true,
            });
            fixture.detectChanges();
        });

        it("should add a notification to the list", () => {
            expect(currentNotifications.size).toBe(1);
            const notification = currentNotifications.first();
            expect(notification.level).toEqual(NotificationLevel.success);
            expect(notification.title).toEqual("FakePersistentNotification");
            expect(notification.message).toEqual("Something happend!");
            expect(notification.config.autoDismiss).toBe(1000);
        });

        it("notificationContainer should display the notification", () => {
            const notificationEl = de.query(By.css("bl-toast"));
            expect(notificationEl).not.toBeNull();

            expect(notificationEl.nativeElement.classList).toContain(NotificationLevel.success);
            expect(notificationEl.nativeElement.classList).not.toContain(NotificationLevel.error);
            expect(notificationEl.nativeElement.classList).not.toContain(NotificationLevel.info);

            const titleEl = notificationEl.query(By.css(".notification-title"));
            const messageEl = notificationEl.query(By.css(".notification-message"));
            expect(titleEl.nativeElement.textContent).toContain("FakePersistentNotification");
            expect(messageEl.nativeElement.textContent).toContain("Something happend!");
        });

        it("should dismiss automatically after 1s and add to persisted list", (done) => {
            expect(currentNotifications.size).not.toBe(0);
            setTimeout(() => {
                fixture.detectChanges();
                expect(currentNotifications.size).toBe(0);
                expect(de.query(By.css("bl-toast"))).toBeNull();
                expect(currentPersistedNotifications.size).toBe(1);
                const notification = currentPersistedNotifications.first();
                expect(notification.level).toEqual(NotificationLevel.success);
                expect(notification.title).toEqual("FakePersistentNotification");
                expect(notification.message).toEqual("Something happend!");
                done();
            }, 1000);
        });

        it("clicking dimiss should dismiss and not add to the list", () => {
            const notificationBtn = de.query(By.css("bl-toast .dismiss-btn"));
            notificationBtn.nativeElement.click();
            fixture.detectChanges();
            expect(currentNotifications.size).toBe(0);
            expect(de.query(By.css("bl-toast"))).toBeNull();
            expect(currentPersistedNotifications.size).toBe(0);
        });
    });

    describe("Calling helper functions", () => {
        it("calling success should show a success notification", () => {
            notificationService.success("FakeNotification", "Something great happend!");
            expect(currentNotifications.size).toBe(1);
            const notification = currentNotifications.first();
            expect(notification.level).toEqual(NotificationLevel.success);
            expect(notification.title).toEqual("FakeNotification");
            expect(notification.message).toEqual("Something great happend!");
        });

        it("calling error should show a error notification", () => {
            notificationService.error("FakeNotification", "Something bad happend!");
            expect(currentNotifications.size).toBe(1);
            const notification = currentNotifications.first();
            expect(notification.level).toEqual(NotificationLevel.error);
            expect(notification.title).toEqual("FakeNotification");
            expect(notification.message).toEqual("Something bad happend!");
        });

        it("calling info should show a error notification", () => {
            notificationService.info("FakeNotification", "Something happend!");
            expect(currentNotifications.size).toBe(1);
            const notification = currentNotifications.first();
            expect(notification.level).toEqual(NotificationLevel.info);
            expect(notification.title).toEqual("FakeNotification");
            expect(notification.message).toEqual("Something happend!");
        });
    });
});
