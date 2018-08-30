import { ComponentFixture, TestBed, fakeAsync, inject, tick } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { ButtonsModule } from "@batch-flask/ui";
import {
    Activity,
    ActivityModule,
    ActivityService,
} from "@batch-flask/ui/activity-monitor";
import { AsyncSubject, BehaviorSubject } from "rxjs";
import { ActivityMonitorItemComponent } from "./activity-monitor-item";
import { ActivityMonitorComponent } from "./activity-monitor.component";

describe("ActivityMonitorFooterComponent", () => {
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
            imports: [ActivityModule, ButtonsModule, MaterialModule],
            declarations: [ActivityMonitorComponent, ActivityMonitorItemComponent],
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

    it("should flash and select the activity specified on creation", fakeAsync(() => {
        const expected = 2;
        activatedRouteSubject.next({id: expected});

        TestBed.compileComponents();
        fixture = TestBed.createComponent(ActivityMonitorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        let flashId;
        let selectId;
        component.flashSubject.subscribe(id => flashId = id);
        component.selectSubject.subscribe(id => selectId = id);

        tick(50);

        expect(flashId).toBe(expected);
        expect(selectId).toBe(expected);
    }));
});
