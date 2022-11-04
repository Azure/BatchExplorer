import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { I18nService, MaterialModule } from "@batch-flask/core";
import { ActivityService, ActivityStatus, ButtonsModule, I18nUIModule } from "@batch-flask/ui";
import { BehaviorSubject, Observable } from "rxjs";
import { runAxe } from "test/utils/helpers/axe-helpers";
import { ActivityMonitorItemActionComponent } from "./activity-monitor-item-action";
import { ActivityMonitorItemComponent } from "./activity-monitor-item.component";

@Component({
    template: `
    <bl-activity-monitor-item
        [activity]="activity"
        [focused]="focused"
        [hovered]="hovered"
        [indent]="indent"
        [expanded]="expanded"
        [(focusedAction)]="focusedAction"
        (toggleRowExpand)="toggleRowExpand()"
    ></bl-activity-monitor-item>
    `,
})
class TestComponent {
    public activity: MockActivity;
    public focused: boolean;
    public hovered: boolean;
    public indent: number;
    public expanded: boolean;
    public focusedAction: number;
    public toggleRowExpand = jasmine.createSpy("toggleRowExpand");

    constructor() {
        this.activity = new MockActivity("Test activity", new BehaviorSubject(0));
        this.focused = false;
        this.hovered = false;
        this.indent = 0;
        this.expanded = false;
        this.focusedAction = null;
    }
}

class MockActivity {
    public static idCounter = 0;

    public name: string;
    public progress: Observable<number>;
    public subactivities: MockActivity[];
    public id: number;
    public statusSubject: BehaviorSubject<ActivityStatus>;
    public error: string;

    constructor(n: string, p: Observable<number>, subs: MockActivity[] = []) {
        this.id = MockActivity.idCounter++;
        this.name = n;
        this.progress = p;
        this.subactivities = subs;
        this.statusSubject = new BehaviorSubject(ActivityStatus.Pending);
        this.error = "";
    }
}

describe("ActivityMonitorItemComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let component: ActivityMonitorItemComponent;

    let activityServiceSpy;

    beforeEach(() => {
        activityServiceSpy = {
            cancel: jasmine.createSpy("cancel"),
            rerun: jasmine.createSpy("rerun"),
        };

        TestBed.configureTestingModule({
            imports: [ButtonsModule, MaterialModule, I18nUIModule],
            declarations: [
                ActivityMonitorItemComponent, ActivityMonitorItemActionComponent, TestComponent
            ],
            providers: [
                { provide: ActivityService, useValue: activityServiceSpy },
                { provide: I18nService, useValue: { translate: () => "" } },
            ],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-activity-monitor-item"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("should display the activity name", () => {
        const nameEl = de.query(By.css(".name"));

        expect(nameEl.nativeElement.textContent).toBe("Test activity");
        expect(nameEl.nativeElement.offsetWidth).toEqual(nameEl.nativeElement.scrollWidth);
    });

    it("should truncate the activity name if it is too long to fit", () => {
        testComponent.activity = new MockActivity(
            "loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo" +
            "ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo" +
            "ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo" +
            "oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong name",
            new BehaviorSubject(0),
        );
        fixture.detectChanges();

        const nameEl = de.query(By.css(".name"));
        expect(nameEl.nativeElement.offsetWidth < nameEl.nativeElement.scrollWidth).toBe(true);
    });

    it("should display the percentage if an activity is emitting progress", () => {
        const subj = new BehaviorSubject(0);
        testComponent.activity = new MockActivity("Test activity", subj);
        fixture.detectChanges();

        const nameEl = de.query(By.css(".progress-percent"));

        expect(component.progress).toBe(0);
        expect(nameEl.nativeElement.textContent).toBe("(0%)");

        subj.next(50);
        fixture.detectChanges();

        expect(component.progress).toBe(50);
        expect(nameEl.nativeElement.textContent).toBe("(50%)");
    });

    it("should update the status of an activity", () => {
        testComponent.activity.statusSubject.next(ActivityStatus.InProgress);
        expect(component.status).toBe(ActivityStatus.InProgress);
    });

    it("should show the error on failure if asked", () => {
        testComponent.activity.statusSubject.next(ActivityStatus.Failed);
        testComponent.activity.error = "Test error";
        expect(component.status).toBe(ActivityStatus.Failed);

        component.toggleShowError();
        fixture.detectChanges();

        expect(de.query(By.css(".error"))).not.toBeFalsy();
    });

    it("should rerun an activity when prompted", () => {
        component.rerun();
        expect(activityServiceSpy.rerun).toHaveBeenCalledOnce();
        expect(activityServiceSpy.rerun).toHaveBeenCalledWith(component.activity);
    });

    it("should cancel an activity when prompted", () => {
        component.cancel();
        expect(activityServiceSpy.cancel).toHaveBeenCalledOnce();
        expect(activityServiceSpy.cancel).toHaveBeenCalledWith(component.activity);
    });

    it("should pass accessibility test", async () => {
        expect(await runAxe(fixture.nativeElement)).toHaveNoViolations();
    });
});
