import { ComponentFixture, TestBed, fakeAsync, inject, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import {
    Activity,
    ActivityModule,
    ActivityMonitorFooterComponent,
    ActivityService,
} from "@batch-flask/ui/activity";
import { AsyncSubject } from "rxjs";

describe("ActivityMonitorFooterComponent", () => {
    let fixture: ComponentFixture<ActivityMonitorFooterComponent>;
    let activityService: ActivityService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule, ActivityModule],
            declarations: [
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(ActivityMonitorFooterComponent);
        fixture.detectChanges();
    });

    beforeEach(inject([ActivityService], (d: ActivityService) => {
        activityService = d;
    }));

    // TODO reimplement tests for activity-monitor-footer
    // currently tests footer as the background task tracker, needs to be updated to work with activity service

    it("Should have the dropdown elements", () => {
        const dropdownEl = fixture.debugElement.query(By.css("bl-dropdown"));
        expect(dropdownEl).not.toBeNull("bl-dropdown should be present");

        const dropdownBtnEl = dropdownEl.query(By.css("[bl-dropdown-btn]"));
        expect(dropdownBtnEl).not.toBeNull("[bl-dropdown-btn] should be present in bl-dropdown");
    });

    it("dropdown button should have the right value", fakeAsync(() => {
        const dropdownBtnEl = fixture.debugElement.query(By.css("[bl-dropdown-btn]"));

        const noTaskMessage = "No current background tasks";
        // There is not current running task yet
        expect(dropdownBtnEl.nativeElement.textContent).toContain(noTaskMessage);

        const subj = new AsyncSubject();

        // Add 1 task
        activityService.exec(new Activity("Task1", () => subj));
        fixture.detectChanges();

        expect(dropdownBtnEl.nativeElement.textContent).not.toContain(noTaskMessage);
        expect(dropdownBtnEl.nativeElement.textContent).toContain("Task1");

        subj.next(null);
        subj.complete();
        tick(1000);
        fixture.detectChanges();

        expect(dropdownBtnEl.nativeElement.textContent).toContain(noTaskMessage);
    }));
});
