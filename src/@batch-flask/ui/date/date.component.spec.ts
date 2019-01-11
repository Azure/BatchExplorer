import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { TimezoneService } from "@batch-flask/core";
import { DateUtils } from "@batch-flask/utils";
import { DateTime } from "luxon";
import { BehaviorSubject } from "rxjs";
import { DateComponent } from "./date.component";

const date1 = new Date(Date.UTC(2017, 8, 3));
const date2 = new Date(Date.UTC(2015, 9, 4));

@Component({
    template: `<bl-date [date]="date"></bl-date>`,
})
class TestComponent {
    public date = date1;
}

describe("DateComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    let timezoneServiceSpy;

    beforeEach(() => {
        timezoneServiceSpy = {
            current: new BehaviorSubject({
                name: "utc",
            }),
        };
        TestBed.configureTestingModule({
            imports: [],
            declarations: [DateComponent, TestComponent],
            providers: [
                { provide: TimezoneService, useValue: timezoneServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-date"));
        fixture.detectChanges();
    });

    it("shows the pretty date in the current timezone", () => {
        const data = DateTime.fromJSDate(date1).setZone("utc");
        expect(de.nativeElement.textContent).toContain(DateUtils.prettyDate(data));
    });

    it("updates the time in the given timezone", () => {
        timezoneServiceSpy.current.next({
            name: "America/Los_Angeles",
        });
        fixture.detectChanges();

        const utcDate = DateTime.fromJSDate(date1).setZone("utc");
        const data = DateTime.fromJSDate(date1).setZone("America/Los_Angeles");
        expect(de.nativeElement.textContent).toContain(DateUtils.prettyDate(data));
        expect(de.nativeElement.textContent).not.toContain(DateUtils.prettyDate(utcDate));
    });

    it("updates the date", () => {
        testComponent.date = date2;
        fixture.detectChanges();
        const data = DateTime.fromJSDate(date2).setZone("utc");
        expect(de.nativeElement.textContent).toContain(DateUtils.prettyDate(data));
    });
});
