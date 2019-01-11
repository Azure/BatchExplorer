import { NgModule } from "@angular/core";
import { TimezoneService } from "@batch-flask/core/timezone";
import { BehaviorSubject } from "rxjs";

export class TestTimezoneService {
    public current = new BehaviorSubject({
        name: "utc",
        offsetNameShort: "UTC",
        offsetNameLong: "UTC",
    });
    public setTimezone = jasmine.createSpy("setTimezone");

}

@NgModule({
    providers: [
        { provide: TimezoneService, useClass: TestTimezoneService },
    ],
})
export class TimeZoneTestingModule {
    public static withZone() {
        const service = new TestTimezoneService();
        service.current.next({
            name: "local",
            offsetNameShort: "local",
            offsetNameLong: "local",
        });
        return {
            ngModule: TimeZoneTestingModule,
            providers: [
                { provide: TestTimezoneService, useValue: service },
            ],
        };
    }
}
