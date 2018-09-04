import { ComponentFixture, TestBed, fakeAsync, inject, tick } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { ButtonsModule } from "@batch-flask/ui";
import {
    Activity,
    ActivityModule,
    ActivityService,
} from "@batch-flask/ui/activity-monitor";
import { FocusSectionModule } from "@batch-flask/ui/focus-section";
import { AsyncSubject, BehaviorSubject } from "rxjs";
import { ActivityMonitorItemComponent } from "./activity-monitor-item";
import { ActivityMonitorItemActionComponent } from "./activity-monitor-item/activity-monitor-item-action";
import { ActivityMonitorTreeViewComponent } from "./activity-monitor-tree-view";
import { ActivityMonitorComponent } from "./activity-monitor.component";

describe("ActivityMonitorComponent", () => {
    let fixture: ComponentFixture<ActivityMonitorComponent>;
    let component: ActivityMonitorComponent;
    let activityService: ActivityService;
    let activatedRouteSpy;
    const activatedRouteSubject = new BehaviorSubject({id: 0});

    beforeEach(() => {
        activatedRouteSpy = {
            params: activatedRouteSubject,
        };

        TestBed.configureTestingModule({
            imports: [ActivityModule, ButtonsModule, MaterialModule, FocusSectionModule],
            declarations: [
                ActivityMonitorComponent, ActivityMonitorTreeViewComponent,
                ActivityMonitorItemComponent, ActivityMonitorItemActionComponent,
            ],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(ActivityMonitorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    beforeEach(inject([ActivityService], (d: ActivityService) => {
        activityService = d;
    }));

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
});
