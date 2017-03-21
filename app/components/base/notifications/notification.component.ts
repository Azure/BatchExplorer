import { Component, HostBinding, Input } from "@angular/core";

import { Notification } from "./notification";
import { NotificationService } from "./notification-service";

@Component({
    selector: "bl-notification",
    templateUrl: "notification.html",
})
export class NotificationComponent {
    @Input()
    public notification: Notification;

    @HostBinding("class")
    public get notificationClass(): string {
        return this.notification && this.notification.level;
    }

    constructor(private notificationService: NotificationService) {
    }

    public dismiss() {
        this.notificationService.dismiss(this.notification);
    }
}
