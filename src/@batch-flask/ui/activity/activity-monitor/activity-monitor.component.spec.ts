import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { I18nService, MaterialModule } from "@batch-flask/core";
import { ButtonsModule, I18nUIModule, ToolbarModule } from "@batch-flask/ui";
import { FocusSectionModule } from "@batch-flask/ui/focus-section";
import { VirtualScrollModule } from "@batch-flask/ui/virtual-scroll";
import { AsyncSubject, BehaviorSubject } from "rxjs";
import { Activity } from "../activity-types";
import { ActivityService } from "../activity.service";
import { ActivityMonitorItemComponent } from "./activity-monitor-item";
import { ActivityMonitorItemActionComponent } from "./activity-monitor-item/activity-monitor-item-action";
import { ActivityMonitorTreeViewComponent } from "./activity-monitor-tree-view";
import { ActivityMonitorComponent } from "./activity-monitor.component";

describe("ActivityMonitorComponent", () => {
    let fixture: ComponentFixture<ActivityMonitorComponent>;
    let component: ActivityMonitorComponent;
    let activityService: ActivityService;
    let activatedRouteSpy;
    const activatedRouteSubject = new BehaviorSubject({ id: 0 });

    beforeEach(() => {
        activatedRouteSpy = {
            params: activatedRouteSubject,
        };

        TestBed.configureTestingModule({
            imports: [ButtonsModule, MaterialModule, FocusSectionModule, VirtualScrollModule, ToolbarModule, I18nUIModule],
            declarations: [
                ActivityMonitorComponent, ActivityMonitorTreeViewComponent,
                ActivityMonitorItemComponent, ActivityMonitorItemActionComponent,
            ],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                ActivityService,
                I18nService
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(ActivityMonitorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        activityService = TestBed.inject(ActivityService);
    });

    it("should receive a new activity and display it", () => {
        const activity = new Activity("Test activity", () => new AsyncSubject());
        activityService.exec(activity);

        expect(component.runningActivities.length).toBe(1);
    });

    it("should receive multiple new activities and display both", () => {
        const activity1 = new Activity("Test activity", () => new AsyncSubject());
        const activity2 = new Activity("Test activity", () => new AsyncSubject());
        activityService.exec(activity1);
        activityService.exec(activity2);

        expect(component.runningActivities.length).toBe(2);
    });

    it("should move a canceled activity to the history queue", () => {
        const activity1 = new Activity("Test activity", () => new AsyncSubject());
        const activity2 = new Activity("Test activity", () => new AsyncSubject());
        activityService.exec(activity1);
        activityService.exec(activity2);

        expect(component.runningActivities.length).toBe(2);

        activity2.cancel();

        expect(component.runningActivities.length).toBe(1);
        expect(component.pastActivities.length).toBe(1);
    });

    it("should cancel all activities", () => {
        const activity1 = new Activity("Test activity", () => new AsyncSubject());
        const activity2 = new Activity("Test activity", () => new AsyncSubject());
        activityService.exec(activity1);
        activityService.exec(activity2);

        expect(component.runningActivities.length).toBe(2);

        component.cancelAll();

        expect(component.runningActivities.length).toBe(0);
    });

    // it("should pass accessibility test", async () => {
    //     expect(await runAxe(fixture.nativeElement)).toHaveNoViolations();
    // });
});
