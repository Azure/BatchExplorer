import { NotificationService } from "@batch-flask/ui/notifications";

export class NotificationServiceMock {
    public error = jasmine.createSpy("error");
    public success = jasmine.createSpy("success");

    public asProvider() {
        return { provide: NotificationService, useValue: this };
    }
}
