import { Component } from "@angular/core";
import { List } from "immutable";
import { Observable } from "rxjs";

import { Notification } from "./notification";
import { NotificationService } from "./notification-service";

@Component({
    selector: "bl-notification-container",
    templateUrl: "notification-container.html",
})
export class NotificationContainerComponent {
    public notifications: Observable<List<Notification>>;

    constructor(notificationService: NotificationService) {
        this.notifications = notificationService.notifications;
    }

    public trackNotification(index, notification: Notification) {
        return notification.id;
    }
}
