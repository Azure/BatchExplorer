import { Component, HostBinding, Input, HostListener } from "@angular/core";

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
    public performMainAction(){
        if (this.notification.config.action) {
            this.notification.config.action();
            this.dismiss();
        }
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
