import { Injectable } from "@angular/core";
import { DateTime } from "luxon";
import { Observable } from "rxjs";
import { map, publishReplay, refCount } from "rxjs/operators";
import { TelemetryService } from "../telemetry";
import { BatchFlaskUserConfiguration, UserConfigurationService } from "../user-configuration";

const localDate = DateTime.local();
export const DEFAULT_TIMEZONE: TimeZone = {
    name: "local",
    offsetNameShort: localDate.offsetNameShort,
    offsetNameLong: localDate.offsetNameLong,
};

export interface TimeZone {
    name: string;
    offsetNameShort: string;
    offsetNameLong: string;
}

/**
 * Service to handle timezone for dates in the app.
 * By default use the local timezone
 */
@Injectable({ providedIn: "root" })
export class TimeZoneService {
    public current: Observable<TimeZone>;

    constructor(
        private userConfiguration: UserConfigurationService<BatchFlaskUserConfiguration>,
        private telemetryService: TelemetryService) {
        this.current = this.userConfiguration.watch("timezone").pipe(
            map((name): TimeZone => {
                name = name || "local";
                const date = DateTime.local().setZone(name);
                if (date.isValid) {
                    return {
                        name,
                        offsetNameShort: date.offsetNameShort,
                        offsetNameLong: date.offsetNameLong,
                    };
                } else {
                    return DEFAULT_TIMEZONE;
                }
            }),
            publishReplay(1),
            refCount(),
        );
    }

    public async setTimezone(timezone: string) {
        this.telemetryService.trackSetting("timezone", timezone);
        return this.userConfiguration.set("timezone", timezone);
    }
}
