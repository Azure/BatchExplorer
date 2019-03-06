import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { List } from "immutable";
import { Subscription } from "rxjs";
import { Notification, NotificationAction, NotificationLevel } from "../notification";
import { NotificationService } from "../notification-service";

import "./persisted-notifications.scss";

@Component({
    selector: "bl-persisted-notifications-dropdown",
    templateUrl: "persisted-notifications-dropdown.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersistedNotificationDropdownComponent implements OnDestroy {
    public NotificationLevel = NotificationLevel;
    public notifications: List<Notification> = List([]);

    private _sub: Subscription;

    constructor(private notificationService: NotificationService, private changeDetector: ChangeDetectorRef) {
        this._sub = notificationService.persistedNotifications.subscribe((notifications) => {
            this.notifications = notifications;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
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

    public trackNotification(index, notification: Notification) {
        return notification.id;
    }

    public trackAction(index, action: NotificationAction) {
        return action.name;
    }
}
