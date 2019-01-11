import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { TimeZone, TimeZoneService } from "@batch-flask/core";
import { DateTime } from "luxon";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import "./timezone-dropdown.scss";

@Component({
    selector: "bl-timezone-dropdown",
    templateUrl: "timezone-dropdown.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimezoneDropdownComponent implements OnDestroy {
    public timezones = [
        { label: `Local (${DateTime.local().offsetNameShort})`, value: "local" },
        { label: "UTC", value: "UTC" },
    ];
    public current: TimeZone | null = null;
    private _destroy = new Subject();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private timezoneService: TimeZoneService) {
        this.timezoneService.current.pipe(takeUntil(this._destroy)).subscribe((current) => {
            this.current = current;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public selectTimezone(timezone: string) {
        this.timezoneService.setTimezone(timezone);
    }

    public handleDblClick() {
        if (this.current.name === "utc") {
            this.selectTimezone("local");
        } else {
            this.selectTimezone("utc");
        }
    }

    public trackTimezone(_: number, timezone: string) {
        return timezone;
    }
}
