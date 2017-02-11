import { Component } from "@angular/core";
import { List } from "immutable";
import { Observable } from "rxjs";

import { Notification } from "./notification";
import { NotificationService } from "./notification-service";

@Component({
    selector: "bex-notification-container",
    templateUrl: "notification-container.html",
})
export class NotificationContainerComponent {
    public notifications: Observable<List<Notification>>;

    constructor(private notificationService: NotificationService) {
        this.notifications = notificationService.notifications;
    }
}
