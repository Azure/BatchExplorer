import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { By } from "@angular/platform-browser";
import { TimeZoneService } from "@batch-flask/core";
import { I18nTestingModule, TestTimeZoneService, TimeZoneTestingModule } from "@batch-flask/core/testing";
import { updateInput } from "test/utils/helpers";
import { DatetimePickerComponent } from "./datetime-picker.component";

@Component({
    template: `<bl-datetime-picker [formControl]="control"></bl-datetime-picker>`,
})
class TestComponent {
    public control = new FormControl();
}

describe("DatetimePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let dateInputEl: DebugElement;
    let timeInputEl: DebugElement;
    let timezoneService: TestTimeZoneService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                FormsModule,
                MatDatepickerModule,
                I18nTestingModule,
                MatNativeDateModule,
                TimeZoneTestingModule,
            ],
            declarations: [DatetimePickerComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-datetime-picker"));
        fixture.detectChanges();

        timezoneService = TestBed.get(TimeZoneService);

        dateInputEl = de.query(By.css("input[formControlName=date]"));
        timeInputEl = de.query(By.css("input[formControlName=time]"));
    });

    describe("when using local time", () => {
        beforeEach(() => {
            timezoneService.setTimezone("local");
            fixture.detectChanges();
        });

        it("propagate the changes when updating the date", () => {
            updateInput(dateInputEl, "12/14/2017");

            expect(testComponent.control.value).toEqual(new Date(2017, 11, 14));
        });

        it("propagate null when only the time is set", () => {
            updateInput(timeInputEl, "17:32");

            expect(testComponent.control.value).toEqual(null);
        });

        it("propagate the changes when updating the date and time", () => {
            updateInput(dateInputEl, "12/14/2017");
            updateInput(timeInputEl, "17:32");

            expect(testComponent.control.value).toEqual(new Date(2017, 11, 14, 17, 32));
        });

        it("correctly handles midnight", () => {
            testComponent.control.setValue(new Date(2022, 3, 15, 0, 0));
            expect(timeInputEl.nativeElement.value).toEqual("00:00");
        });

        it("updates the inputs when setting the date time as a string", () => {
            testComponent.control.setValue(new Date(2017, 11, 14, 17, 32).toISOString());
            expect(dateInputEl.nativeElement.value).toEqual("12/14/2017");
            expect(timeInputEl.nativeElement.value).toEqual("17:32");
        });

        it("updates the inputs when setting the date time as a date", () => {
            testComponent.control.setValue(new Date(2017, 11, 14, 17, 32));
            expect(dateInputEl.nativeElement.value).toEqual("12/14/2017");
            expect(timeInputEl.nativeElement.value).toEqual("17:32");
        });
    });

    describe("when using utc time", () => {
        beforeEach(() => {
            timezoneService.setTimezone("utc");
            fixture.detectChanges();
        });

        it("propagate the changes when updating the date", () => {
            updateInput(dateInputEl, "12/14/2017");

            expect(testComponent.control.value).toEqual(new Date(Date.UTC(2017, 11, 14)));
        });

        it("propagate null when only the time is set", () => {
            updateInput(timeInputEl, "17:32");

            expect(testComponent.control.value).toEqual(null);
        });

        it("propagate the changes when updating the date and time", () => {
            updateInput(dateInputEl, "12/14/2017");
            updateInput(timeInputEl, "17:32");

            expect(testComponent.control.value).toEqual(new Date(Date.UTC(2017, 11, 14, 17, 32)));
        });

        it("updates the inputs when setting the date time as a string", () => {
            testComponent.control.setValue(new Date(Date.UTC(2017, 11, 14, 17, 32)).toISOString());
            expect(dateInputEl.nativeElement.value).toEqual("12/14/2017");
            expect(timeInputEl.nativeElement.value).toEqual("17:32");
        });

        it("updates the inputs when setting the date time as a date", () => {
            testComponent.control.setValue(new Date(Date.UTC(2017, 11, 14, 17, 32)));
            expect(dateInputEl.nativeElement.value).toEqual("12/14/2017");
            expect(timeInputEl.nativeElement.value).toEqual("17:32");
        });
    });

});
