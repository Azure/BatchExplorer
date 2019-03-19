import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { TimeZoneService } from "@batch-flask/core";
import { TestTimeZoneService, TimeZoneTestingModule } from "@batch-flask/core/testing";
import { DateUtils } from "@batch-flask/utils";
import { DateTime } from "luxon";
import { PropertyContentComponent } from "../property-content";
import { PropertyFieldComponent } from "../property-field";
import { DatePropertyComponent } from "./date-property.component";

const date1 = new Date(Date.UTC(2017, 8, 3));
const date2 = new Date(Date.UTC(2015, 9, 4));

@Component({
    template: `<bl-date-property label="My date label" [value]="date"></bl-date-property>`,
})
class TestComponent {
    public date = date1;
}

describe("DatePropertyComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let valueEl: DebugElement;

    let timeZoneServiceSpy: TestTimeZoneService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TimeZoneTestingModule],
            declarations: [DatePropertyComponent, PropertyFieldComponent, PropertyContentComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-date-property"));
        fixture.detectChanges();
        valueEl = de.query(By.css("bl-property-content"));

        timeZoneServiceSpy = TestBed.get(TimeZoneService);
    });

    it("shows the pretty date in the current timezone", () => {
        const data = DateTime.fromJSDate(date1).setZone("utc");
        expect(valueEl.nativeElement.textContent).toContain(DateUtils.fullDateAndTime(data));
    });

    it("updates the time in the given timezone", () => {
        timeZoneServiceSpy.setTimezone("America/Los_Angeles");
        fixture.detectChanges();

        const utcDate = DateTime.fromJSDate(date1).setZone("utc");
        const data = DateTime.fromJSDate(date1).setZone("America/Los_Angeles");
        expect(valueEl.nativeElement.textContent).toContain(DateUtils.fullDateAndTime(data));
        expect(valueEl.nativeElement.textContent).not.toContain(DateUtils.fullDateAndTime(utcDate));
    });

    it("updates the date", () => {
        testComponent.date = date2;
        fixture.detectChanges();
        const data = DateTime.fromJSDate(date2).setZone("utc");
        expect(valueEl.nativeElement.textContent).toContain(DateUtils.fullDateAndTime(data));
    });
});
