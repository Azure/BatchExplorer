import { Component, ChangeDetectionStrategy, OnDestroy, Input, EventEmitter, Output, OnChanges } from "@angular/core";
import { I18nService, TenantSettingsService } from "@batch-flask/core";
import { TenantDetails } from "app/models";
import { TenantAuthorization, TenantStatus } from "app/services";
import { Subject } from "rxjs";
import { TenantRefreshModel } from ".";

import "./tenant-card.scss";

@Component({
    selector: "be-tenant-card",
    templateUrl: "tenant-card.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantCardComponent implements OnDestroy, OnChanges {
    private _destroy = new Subject();
    @Input() authorization: TenantAuthorization;

    status: TenantStatus;
    tenant: TenantDetails;
    active: boolean;

    // Required for supporting enums within Angular templates
    tenantStatus = TenantStatus;

    // Used to call the parent's authorize() when a tenant is selected
    @Output() refreshTenant: EventEmitter<TenantRefreshModel> =
        new EventEmitter();

    constructor(
        private i18n: I18nService,
        private settingsService: TenantSettingsService
    ) {
        this.refresh = this.refresh.bind(this);
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public ngOnChanges() {
        this.status = this.authorization.status;
        this.tenant = this.authorization.tenant;
        this.active = this.authorization.active;
    }

    statusText = () => this.i18n.t(`tenant-card.status-${this.status}`);

    checkboxTooltip = () =>
        this.i18n.t(`tenant-card.${this.active ? "deactivate" : "activate"}`);

    isHomeTenant = () => this.authorization.tenant.homeTenantId ===
        this.authorization.tenant.tenantId;

    onSelectionChanged(observed) {
        this.settingsService.setTenantActive(
            this.tenant.tenantId, observed.checked);

        this.active = observed.checked;
        this.refresh(this.active);
    }

    refresh(reauthenticate = false) {
        this.refreshTenant.emit({
            tenantId: this.tenant.tenantId,
            reauthenticate
        })
    }
}
