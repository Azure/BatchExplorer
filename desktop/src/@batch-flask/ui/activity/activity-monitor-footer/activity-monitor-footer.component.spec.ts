import { ComponentFixture, TestBed, fakeAsync, inject, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import {
    Activity,
    ActivityModule,
    ActivityMonitorFooterComponent,
    ActivityService,
} from "@batch-flask/ui/activity";
import { AsyncSubject } from "rxjs";
import { runAxe } from "test/utils/helpers/axe-helpers";

describe("ActivityMonitorFooterComponent", () => {
    let fixture: ComponentFixture<ActivityMonitorFooterComponent>;
    let component: ActivityMonitorFooterComponent;
    let activityService: ActivityService;
    let routerSpy;

    beforeEach(() => {
        routerSpy = {
            navigate: jasmine.createSpy("navigate"),
        };

        TestBed.configureTestingModule({
            imports: [MaterialModule, ActivityModule, I18nTestingModule],
            declarations: [
            ],
            providers: [
                { provide: Router, useValue: routerSpy },
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(ActivityMonitorFooterComponent);
        fixture.detectChanges();
        component = fixture.componentInstance;
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

    it("should tell the router to navigate", () => {
        component.openMonitor();

        expect(routerSpy.navigate).toHaveBeenCalledOnce();
        expect(routerSpy.navigate).toHaveBeenCalledWith(["/activitymonitor"]);
    });

    it("should tell the router to navigate to a given activity", () => {
        component.openMonitor(3);

        expect(routerSpy.navigate).toHaveBeenCalledOnce();
        expect(routerSpy.navigate).toHaveBeenCalledWith(["/activitymonitor", 3]);
    });

    it("should pass accessibility test", async () => {
        expect(await runAxe(fixture.nativeElement)).toHaveNoViolations();
    });
});
