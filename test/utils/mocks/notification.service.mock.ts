import { NotificationService } from "app/components/base/notifications";

export class NotificationServiceMock {
    public error: jasmine.Spy;

    constructor() {
        this.error = jasmine.createSpy("error");
    }

    public asProvider() {
        return { provide: NotificationService, useValue: this };
    }
}
