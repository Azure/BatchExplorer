import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { TimezoneService } from "@batch-flask/core";
import { DateTime } from "luxon";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import "./timezone-dropdown.scss";

const localTimezoneName = DateTime.local().offsetNameShort;

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
    public current: {
        value: string,
        label: string,
    } = {
            value: "",
            label: "",
        };
    private _destroy = new Subject();

    constructor(private changeDetector: ChangeDetectorRef, private timezoneService: TimezoneService) {
        this.timezoneService.current.pipe(takeUntil(this._destroy)).subscribe((current) => {
            this.current = {
                label: this._getTimezoneLabel(current),
                value: current,
            };
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

    public trackTimezone(_: number, timezone: string) {
        return timezone;
    }

    private _getTimezoneLabel(timezone: string) {
        if (timezone === "local") {
            return localTimezoneName;
        } else {
            return timezone;
        }
    }
}
