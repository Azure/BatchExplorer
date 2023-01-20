import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { I18nService } from "@batch-flask/core";
import { NotificationService, Notification } from "@batch-flask/ui";
import { TenantAuthorization } from ".";

const SETTINGS_ROUTE = "/auth-settings";

@Injectable({ providedIn: "root" })
export class TenantErrorService {
    private _tenantErrorNotifications: StringMap<Notification> = {};

    constructor(
        private notificationService: NotificationService,
        private i18n: I18nService,
        private router: Router
    ) {}

    public showError(authorization: TenantAuthorization) {
        const tenantId = authorization.tenant.tenantId;
        let notification =
            this._tenantErrorNotifications[tenantId];
        this.notificationService.dismiss(notification);
        notification = this.notificationService.error(
            authorization.message,
            this.i18n.t("tenant-error-service.error-action"),
            {
                autoDismiss: 0,
                persist: true,
                action: () => this.router.navigateByUrl(SETTINGS_ROUTE)
            }
        );
        this._tenantErrorNotifications[authorization.tenant.tenantId] =
            notification;
        return notification;
    }
}
