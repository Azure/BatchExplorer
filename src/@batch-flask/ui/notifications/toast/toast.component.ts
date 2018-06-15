import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Injector, Input } from "@angular/core";

import { MouseButton } from "@batch-flask/core";
import { ClickableComponent } from "@batch-flask/ui/buttons";
import { Notification, NotificationAction } from "../notification";
import { NotificationService } from "../notification-service";
import "./toast.scss";

@Component({
    selector: "bl-toast",
    templateUrl: "toast.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent extends ClickableComponent {
    @Input() public notification: Notification;

    @HostBinding("class")
    public get notificationClass(): string {
        const level = this.notification && this.notification.level;

        return `${level} focus-outline`;
    }

    constructor(injector: Injector, private notificationService: NotificationService) {
        super(injector, null);
    }

    public handleAction(event) {
        super.handleAction(event);
        if (this.notification.config.action) {
            this.notification.config.action();
            this.dismiss();
        }
    }

    @HostListener("mouseup", ["$event"])
    public handleMouseUp(event: MouseEvent, tab) {
        if (event.button === MouseButton.middle) { // Middle click
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

    public trackAction(index, action: NotificationAction) {
        return action.name;
    }
}
