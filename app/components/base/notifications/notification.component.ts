import { Component, HostBinding, HostListener, Input } from "@angular/core";

import { Constants } from "app/utils";
import { Notification, NotificationAction } from "./notification";
import { NotificationService } from "./notification-service";
import "./notification.scss";

@Component({
    selector: "bl-notification",
    templateUrl: "notification.html",
})
export class NotificationComponent {
    @Input()
    public notification: Notification;

    @HostBinding("class")
    public get notificationClass(): string {
        return this.notification && this.notification.level;
    }

    constructor(private notificationService: NotificationService) {
    }

    @HostListener("click")
    public performMainAction() {
        if (this.notification.config.action) {
            this.notification.config.action();
            this.dismiss();
        }
    }

    @HostListener("mouseup", ["$event"])
    public handleMouseUp(event: MouseEvent, tab) {
        if (event.button === Constants.MouseButton.middle) { // Middle click
            this.dismiss();
        }
    }

    @HostListener("mouseenter", ["$event"])
    public pauseNotificationAutoDismiss(event: MouseEvent) {
        this.notificationService.pauseAutoDimiss(this.notification);
    }

    @HostListener("mouseleave", ["$event"])
    public resumeNotificationAutoDismiss(event: MouseEvent) {
        this.notificationService.resumeAutoDimiss(this.notification);
    }

    public dismiss() {
        this.notificationService.dismiss(this.notification);
    }

    public get actions() {
        return this.notification.config.actions;
    }

    public performAction(event: Event, action: NotificationAction) {
        action.do();
        this.dismiss();
    }
}
