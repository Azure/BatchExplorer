import { Component } from "@angular/core";
import { List } from "immutable";

import { Notification, NotificationAction, NotificationLevel } from "../notification";
import { NotificationService } from "../notification-service";

import "./persisted-notifications.scss";

@Component({
    selector: "bl-persisted-notifications-dropdown",
    templateUrl: "persisted-notifications-dropdown.html",
})
export class PersistedNotificationDropdownComponent {
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

    public performAction(event: Event, notification: Notification, action: NotificationAction) {
        action.do();
        this.dismiss(event, notification);
    }
}
