import { Component } from "@angular/core";
import { List } from "immutable";

import { Notification, NotificationLevel } from "../notification";
import { NotificationService } from "../notification-service";

@Component({
    selector: "bl-persistent-notifications-dropdown",
    templateUrl: "persistent-notifications-dropdown.html",
})
export class PersistentNotificationDropdownComponent {
    public NotificationLevel = NotificationLevel;
    public notifications: List<Notification> = List([]);

    constructor(private notificationService: NotificationService) {
        notificationService.persistedNotifications.subscribe((notifications) => {
            this.notifications = notifications;
        });
    }

    public dismiss(event: Event, notification: Notification) {
        this.notificationService.dismiss(notification);
        event.stopPropagation();
    }

    public dismissAll() {
        this.notificationService.dismissAll();
    }
}
