import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, NgZone, OnDestroy } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { AuthService, reauthenticateAll, TenantAuthorization } from "app/services";
import { Subject, throwError } from "rxjs";
import { catchError, first, takeUntil } from "rxjs/operators";

import "./tenant-picker.scss";

type TenantSettingsChanged = (value: TenantAuthorization[]) => void;

// Data sent from a child component when a tenant is refreshed
export interface TenantRefreshModel {
    tenantId?: string;
    reauthenticate?: boolean;
}

@Component({
    selector: "be-tenant-picker",
    templateUrl: "tenant-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TenantPickerComponent),
            multi: true
        }
    ]
})
export class TenantPickerComponent implements ControlValueAccessor, OnDestroy {
    public static breadcrumb() {
        return { name: "Tenants" };
    }

    public tenantSettings = new FormControl<TenantAuthorization[]>([]);
    public saved: false;

    private _destroy = new Subject();
    private _propagateChange?: TenantSettingsChanged;

    constructor(
        private zone: NgZone,
        private auth: AuthService,
        private changeDetector: ChangeDetectorRef
    ) {
        this.tenantSettings.valueChanges.pipe(takeUntil(this._destroy))
        .subscribe(value => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        });
        this.fetchTenantAuthorizations();
        this.refresh = this.refresh.bind(this);
    }

    private fetchTenantAuthorizations(data: TenantRefreshModel = {}) {
        let reauthenticate = "";
        if (data.reauthenticate) {
            if (data.tenantId) {
                reauthenticate = data.tenantId;
            } else {
                reauthenticate = reauthenticateAll
            }
        }

        this.auth.getTenantAuthorizations({
            notifyOnError: false,
            reauthenticate
        }).pipe(
            takeUntil(this._destroy),
            catchError(error => throwError(error)),
            first() // Unsubscribes on successful pipe
        ).subscribe(authorizations => this.writeValue(authorizations));
    }

    trackByIndex(index) {
        return index;
    }

    writeValue(obj: TenantAuthorization[] | null): void {
        this.tenantSettings.setValue(obj || []);
        this.changeDetector.markForCheck();
    }

    public registerOnChange(fn: TenantSettingsChanged): void {
        this._propagateChange = fn;
    }

    registerOnTouched(): void {
        // NOOP
    }

    public refresh() {
        // Refresh all tenants from the server
        this.fetchTenantAuthorizations({ reauthenticate: true });
    }

    public refreshTenant(refreshData: TenantRefreshModel) {
        this.fetchTenantAuthorizations(refreshData);
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }
}
