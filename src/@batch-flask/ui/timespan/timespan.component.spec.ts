import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DateTime } from "luxon";
import { TimespanComponent, TimespanDisplayType } from "./timespan.component";

@Component({
    template: `
        <bl-timespan [startTime]="startTime" [endTime]="endTime" type="type">
        </bl-timespan>
    `,
})
class TestComponent {
    public startTime: Date = null;
    public endTime: Date = null;
    public type = TimespanDisplayType.compact;
}

describe("TimespanComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: TimespanComponent;
    let de: DebugElement;
    let nowDate;

    function passTime(milli: number) {
        nowDate = nowDate.add(milli, "milliseconds");
        tick(milli);
    }

    beforeEach(() => {
        nowDate = DateTime.local();
        TestBed.configureTestingModule({
            imports: [],
            declarations: [TimespanComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-timespan"));
        component = de.componentInstance;
        fixture.detectChanges();
        spyOn(component, "now").and.callFake(() => nowDate);
    });

    describe("when providing start and endtime", () => {
        beforeEach(() => {
            const start = DateTime.local();
            testComponent.startTime = start.toJSDate();
            testComponent.endTime = start.plus({seconds: 83}).toJSDate();
            fixture.detectChanges();
        });

        it("should show the duration between start and end", () => {
            expect(de.nativeElement.textContent).toContain("1:23");
        });

        it("should not update with time", fakeAsync(() => {
            tick(4000);
            fixture.detectChanges();
            expect(de.nativeElement.textContent).toContain("1:23");
        }));
    });

    describe("when providing only start time", () => {
        function reset() {
            const start = DateTime.local().minus({seconds: 123}).toJSDate();
            testComponent.startTime = start;
            fixture.detectChanges();
        }

        it("should show the duration between start and end", () => {
            reset();
            expect(de.nativeElement.textContent).toContain("2:03");
        });

        it("should update with time", fakeAsync(() => {
            reset();
            passTime(4000);
            fixture.detectChanges();
            expect(de.nativeElement.textContent).toContain("2:07");
            passTime(1000);
            fixture.detectChanges();
            expect(de.nativeElement.textContent).toContain("2:08");
            discardPeriodicTasks();
        }));
    });

    describe("when providing only end time", () => {
        function reset() {
            const end = DateTime.local().plus({seconds: 234}).toJSDate();
            testComponent.endTime = end;
            fixture.detectChanges();
        }

        it("should show the duration between start and end", () => {
            reset();
            expect(de.nativeElement.textContent).toContain("3:54");
        });

        it("should update with time", fakeAsync(() => {
            reset();
            passTime(4000);
            fixture.detectChanges();
            expect(de.nativeElement.textContent).toContain("3:50");
            passTime(1000);
            fixture.detectChanges();
            expect(de.nativeElement.textContent).toContain("3:49");
            discardPeriodicTasks();
        }));
    });
});
