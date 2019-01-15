import {
    Notification, NotificationConfig, NotificationLevel, NotificationService,
} from "@batch-flask/ui/notifications";

export class NotificationServiceMock {
    public error = jasmine.createSpy("error")
        .and.callFake((...args) => this._createNotification(NotificationLevel.error, ...args));
    public success = jasmine.createSpy("success")
        .and.callFake((...args) => this._createNotification(NotificationLevel.success, ...args));
    public info = jasmine.createSpy("info")
        .and.callFake((...args) => this._createNotification(NotificationLevel.info, ...args));
    public lastNotification: Notification;

    public asProvider() {
        return { provide: NotificationService, useValue: this };
    }

    private _createNotification(
        level: NotificationLevel, title?: string, message?: string, config?: NotificationConfig) {

        const notification = new Notification(level, title, message, config);
        this.lastNotification = notification;
        return notification;
    }
}
