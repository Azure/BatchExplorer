import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import * as moment from "moment";

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

fdescribe("TimespanComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: TimespanComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [TimespanComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-timespan"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    describe("when providing start and endtime", () => {
        beforeEach(() => {
            const start = moment();
            testComponent.startTime = start.toDate();
            testComponent.endTime = start.add(70, "seconds").toDate();
            fixture.detectChanges();
        });

        it("should show the duration between start and end", () => {
            expect(de.nativeElement.textContent).toContain("00:01:70");
        });
    });
});
