import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { BatchFlaskUserConfiguration, UserConfigurationService } from "../user-configuration";

const DEFAULT_TIMEZONE = "local";

/**
 * Service to handle timezone for dates in the app.
 * By default use the local timezone
 */
@Injectable({ providedIn: "root" })
export class TimezoneService {
    public current: Observable<string>;

    constructor(private userConfiguration: UserConfigurationService<BatchFlaskUserConfiguration>) {
        this.current = this.userConfiguration.watch("timezone").pipe(
            map(x => x || DEFAULT_TIMEZONE),
        );
    }

    public async setTimezone(timezone: string) {
        return this.userConfiguration.set("timezone", timezone);
    }
}
