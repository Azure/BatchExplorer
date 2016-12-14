import { Component } from "@angular/core";
import { List } from "immutable";
import { Observable } from "rxjs";

import { Notification } from "./notification";
import { NotificationManager } from "./notification-manager";

@Component({
    selector: "bex-notification-container",
    templateUrl: "notification-container.html",
})
export class NotificationContainerComponent {
    public notifications: Observable<List<Notification>>;

    constructor(private notificationManager: NotificationManager) {
        this.notifications = notificationManager.notifications;
    }
}
