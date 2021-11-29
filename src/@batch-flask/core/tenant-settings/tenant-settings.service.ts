import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { publishReplay, refCount } from "rxjs/operators";
import { BatchFlaskUserConfiguration, UserConfigurationService } from "../user-configuration";

export interface TenantSettings {
    [tenantId: string]: "active" | "inactive"
}

/**
 * Service for managing tenant configurations (whether a tenant is active or
 * not)
 */
@Injectable({ providedIn: "root" })
export class TenantSettingsService {
    public current: Observable<TenantSettings>;

    constructor(
        private userConfiguration:
            UserConfigurationService<BatchFlaskUserConfiguration>
    ) {
        this.current = this.userConfiguration.watch("tenants").pipe(
            publishReplay(1),
            refCount()
        );
    }

    public async setTenantActive(tenantId: string, active: boolean) {
        this.current.subscribe(tenants => {
            tenants[tenantId] = active ? "active" : "inactive";
            this.userConfiguration.set("tenants", tenants);
        });
    }
}
