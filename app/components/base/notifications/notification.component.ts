import { Component, HostBinding, Input } from "@angular/core";
import { List } from "immutable";
import { Observable } from "rxjs";

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
        console.log("Dismiss");
        this.notificationManager.dismiss(this.notification);
    }
}
