import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { List } from "immutable";
import { Subscription } from "rxjs";
import { Notification } from "../notification";
import { NotificationService } from "../notification-service";

import "./toasts-container.scss";

@Component({
    selector: "bl-toasts-container",
    templateUrl: "toasts-container.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastsContainerComponent implements OnDestroy {
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
