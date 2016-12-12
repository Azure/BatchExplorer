import { Component, HostBinding, Input } from "@angular/core";

import { Notification } from "./notification";
import { NotificationManager } from "./notification-manager";

@Component({
    selector: "bex-notification",
    templateUrl: "notification.html",
})
export class NotificationComponent {
    @Input()
    public notification: Notification;

    @HostBinding("class")
    public get notificationClass(): string {
        return this.notification && this.notification.level;
    }

    constructor(private notificationManager: NotificationManager) {
    }

    public dismiss() {
        this.notificationManager.dismiss(this.notification);
    }
}
