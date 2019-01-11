import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy,
} from "@angular/core";
import { TimezoneService } from "@batch-flask/core";
import { DateUtils } from "@batch-flask/utils";
import { DateTime } from "luxon";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "bl-date-property",
    template: "{{formatedDate}}",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePropertyComponent implements OnChanges, OnDestroy {
    @Input() public label: string;
    @Input() public value: Date;

    public title: string;

    public formatedDate: string;

    private _date = new BehaviorSubject(null);
    private _destroy = new Subject();

    constructor(private changeDetector: ChangeDetectorRef, private timezoneService: TimezoneService) {
        combineLatest(this.timezoneService.current, this._date).pipe(
            takeUntil(this._destroy),
        ).subscribe(([zone, jsDate]) => {
            if (jsDate) {
                const date = DateTime.fromJSDate(jsDate).setZone(zone.name);
                this.formatedDate = DateUtils.fullDateAndTime(date);
                this.title = date.toISO();
            } else {
                this.formatedDate = "-";
                this.title = "-";
            }
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes) {
        if (changes.value) {
            this._date.next(this.value);
        }
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }
}
