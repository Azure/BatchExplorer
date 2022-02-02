import { Injectable } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";
import { Notification, NotificationConfig, NotificationLevel, NotificationTimer } from "./notification";

function mergeConfig(defaultConfig: NotificationConfig, userConfig: NotificationConfig) {
    return { ...defaultConfig, ...userConfig };
}

@Injectable({ providedIn: "root" })
export class NotificationService {
    public notifications: Observable<List<Notification>>;
    public persistedNotifications: Observable<List<Notification>>;

    private _notifications = new BehaviorSubject(List<Notification>([]));
    private _persistedNotifications = new BehaviorSubject(List<Notification>([]));
    private _dismissTimers: StringMap<NotificationTimer> = {};

    constructor() {
        this.notifications = this._notifications.asObservable();
        this.persistedNotifications = this._persistedNotifications.asObservable();
    }

    public notify(
        level: NotificationLevel,
        title: string,
        message: string,
        config: NotificationConfig = {}
    ): Notification {
        const notification = new Notification(level, title, message, config);
        this._notifications.next(this._notifications.getValue().push(notification));
        if (config.autoDismiss > 0) {
            this._registerForDismiss(notification);
        }
        return notification;
    }

    public info(title: string, message: string, config: NotificationConfig = {}): Notification {
        return this.notify(NotificationLevel.info, title, message, config);
    }

    public success(title: string, message: string, config: NotificationConfig = {}): Notification {
        return this.notify(NotificationLevel.success, title, message, config);
    }

    public error(title: string, message: string, config: NotificationConfig = {}): Notification {
        const defaultConfig: NotificationConfig = { persist: true };
        return this.notify(NotificationLevel.error, title, message, mergeConfig(defaultConfig, config));
    }

    public warn(title: string, message: string, config: NotificationConfig = {}): Notification {
        const defaultConfig: NotificationConfig = { persist: true };
        return this.notify(NotificationLevel.warn, title, message, mergeConfig(defaultConfig, config));
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
        if (this._dismissTimers[notification.id]) {
            this._dismissTimers[notification.id].clear();
        }
        const newNotifications = this._notifications.value.filter(x => x.id !== notification.id);
        this._notifications.next(List<Notification>(newNotifications));
        if (persistIfApplicable && notification.config.persist) {
            this._persistedNotifications.next(this._persistedNotifications.value.push(notification));
        } else {
            const newPersistedNotifications = this._persistedNotifications.value.filter(x => x.id !== notification.id);
            this._persistedNotifications.next(List<Notification>(newPersistedNotifications));
        }
    }

    /**
     * Dismiss all notifcations
     */
    public dismissAll() {
        this._notifications.next(List([]));
        this._persistedNotifications.next(List([]));
    }

    public pauseAutoDimiss(notification: Notification) {
        if (notification.id in this._dismissTimers) {
            this._dismissTimers[notification.id].pause();
        }
    }

    public resumeAutoDimiss(notification: Notification) {
        if (notification.id in this._dismissTimers) {
            this._dismissTimers[notification.id].resume();
        }
    }

    private _registerForDismiss(notification: Notification) {
        this._dismissTimers[notification.id] = new NotificationTimer(() => {
            this.dismiss(notification, true);
        }, notification.config.autoDismiss);
    }
}
