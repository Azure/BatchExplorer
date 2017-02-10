import { Component } from "@angular/core";
import { List } from "immutable";

import { Notification, NotificationLevel } from "../notification";
import { NotificationManager } from "../notification-manager";

@Component({
    selector: "bex-persistent-notifications-dropdown",
    templateUrl: "persistent-notifications-dropdown.html",
})
export class PersistentNotificationDropdownComponent {
    public NotificationLevel = NotificationLevel;
    public notifications: List<Notification> = List([]);

    constructor(private notificationManager: NotificationManager) {
        notificationManager.persistedNotifications.subscribe((notifications) => {
            this.notifications = notifications;
        });
    }

    public dismiss(event: Event, notification: Notification) {
        this.notificationManager.dismiss(notification);
        event.stopPropagation();
    }

    public dismissAll() {
        this.notificationManager.dismissAll();
    }
}
