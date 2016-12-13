import { Injectable } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { Notification, NotificationConfig, NotificationLevel } from "./notification";

@Injectable()
export class NotificationManager {
    public notifications: Observable<List<Notification>>;

    private _notifications = new BehaviorSubject(List<Notification>([]));
    private _dimissTimeouts = {};

    constructor() {
        this.notifications = this._notifications.asObservable();
    }

    public notify(
        level: NotificationLevel,
        title: string,
        message: string,
        config: NotificationConfig = {}): Notification {

        const notification = new Notification(level, title, message, config);
        this._notifications.next(this._notifications.getValue().push(notification));
        this._registerForDismiss(notification);
        return notification;
    }

    public info(title: string, message: string, config: NotificationConfig = {}): Notification {
        return this.notify(NotificationLevel.info, title, message, config);
    }

    public success(title: string, message: string, config: NotificationConfig = {}): Notification {
        return this.notify(NotificationLevel.success, title, message, config);
    }

    public error(title: string, message: string, config: NotificationConfig = {}): Notification {
        return this.notify(NotificationLevel.error, title, message, config);
    }

    /**
     * Dismiss the given notification.
     * @param notification Notification to dimiss
     * @param persistIfApplicable If the notification can be persisted
     *   this will move the notification to the notification tray
     */
    public dismiss(notification: Notification, persistIfApplicable = false) {
        if (!notification) {
            return;
        }
        if (this._dimissTimeouts[notification.id]) {
            clearTimeout(this._dimissTimeouts[notification.id]);
        }
        const newNotifications = this._notifications.getValue().filter((x) => x.id !== notification.id);
        this._notifications.next(List<Notification>(newNotifications));
    }

    private _registerForDismiss(notification: Notification) {
        this._dimissTimeouts[notification.id] = setTimeout(() => {
            this.dismiss(notification, true);
        }, notification.config.autoDismiss);
    }
}
