import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { Notification } from "./notification";
import { NotificationService } from "./notification-service";

@Component({
    selector: "bl-notification-container",
    templateUrl: "notification-container.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationContainerComponent implements OnDestroy {
    public notifications: List<Notification>;

    private _sub: Subscription;

    constructor(notificationService: NotificationService, changeDetector: ChangeDetectorRef) {
        this._sub = notificationService.notifications.subscribe((notifications) => {
            this.notifications = notifications;
            changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public trackNotification(index, notification: Notification) {
        return index;
    }
}
