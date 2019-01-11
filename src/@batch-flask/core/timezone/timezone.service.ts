import { Injectable } from "@angular/core";
import { DateTime } from "luxon";
import { Observable } from "rxjs";
import { map, publishReplay, refCount } from "rxjs/operators";
import { BatchFlaskUserConfiguration, UserConfigurationService } from "../user-configuration";

const localDate = DateTime.local();
const DEFAULT_TIMEZONE: Timezone = {
    name: "local",
    offsetNameShort: localDate.offsetNameShort,
    offsetNameLong: localDate.offsetNameLong,
};

export interface Timezone {
    name: string;
    offsetNameShort: string;
    offsetNameLong: string;
}

/**
 * Service to handle timezone for dates in the app.
 * By default use the local timezone
 */
@Injectable({ providedIn: "root" })
export class TimezoneService {
    public current: Observable<Timezone>;

    constructor(private userConfiguration: UserConfigurationService<BatchFlaskUserConfiguration>) {
        this.current = this.userConfiguration.watch("timezone").pipe(
            map((name) => {
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
        return this.userConfiguration.set("timezone", timezone);
    }
}
