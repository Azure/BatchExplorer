import { NgModule } from "@angular/core";
import { DEFAULT_TIMEZONE, TimeZoneService } from "@batch-flask/core/timezone";
import { DateTime } from "luxon";
import { BehaviorSubject } from "rxjs";

export class TestTimeZoneService {
    public current = new BehaviorSubject({
        name: "utc",
        offsetNameShort: "UTC",
        offsetNameLong: "UTC",
    });
    public setTimezone = jasmine.createSpy("setTimezone").and.callFake(this._setTimezone.bind(this));

    private _setTimezone(name: string) {
        name = name || "local";
        const date = DateTime.local().setZone(name);
        if (date.isValid) {
            this.current.next({
                name,
                offsetNameShort: date.offsetNameShort,
                offsetNameLong: date.offsetNameLong,
            });
        } else {
            return this.current.next(DEFAULT_TIMEZONE);
        }
    }

}

@NgModule({
    providers: [
        { provide: TimeZoneService, useClass: TestTimeZoneService },
    ],
})
export class TimeZoneTestingModule {
    public static withZone() {
        const service = new TestTimeZoneService();
        service.current.next({
            name: "local",
            offsetNameShort: "local",
            offsetNameLong: "local",
        });
        return {
            ngModule: TimeZoneTestingModule,
            providers: [
                { provide: TestTimeZoneService, useValue: service },
            ],
        };
    }
}
