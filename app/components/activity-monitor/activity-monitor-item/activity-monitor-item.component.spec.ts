import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import { ActivityService, ActivityStatus, ButtonsModule } from "@batch-flask/ui";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";
import { ActivityMonitorItemComponent } from "./activity-monitor-item.component";

@Component({
    template: `
        <bl-activity-monitor-item
            [activity]="activity"
            [selectSubject]="selectSubj"
            [flashSubject]="flashSubj"
            [keyDownSubject]="keyDownSubj"
        ></bl-activity-monitor-item>
    `,
})
class TestComponent {
    public activity: MockActivity;
    public progressSubj: BehaviorSubject<number>;
    public selectSubj: BehaviorSubject<number>;
    public flashSubj: BehaviorSubject<number>;
    public keyDownSubj: BehaviorSubject<KeyboardEvent>;

    constructor() {
        this.progressSubj = new BehaviorSubject(0);
        this.selectSubj = new BehaviorSubject(-1);
        this.flashSubj = new BehaviorSubject(-1);
        this.keyDownSubj = new BehaviorSubject(null);
        this.activity = new MockActivity("Test activity", this.progressSubj);
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

fdescribe("ActivityMonitorItemComponent", () => {
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
            imports: [ButtonsModule, MaterialModule],
            declarations: [ActivityMonitorItemComponent, TestComponent],
            providers: [
                { provide: ActivityService, useValue: activityServiceSpy },
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

        expect(nameEl.nativeElement.textContent).toContain("Test activity");
        expect(nameEl.nativeElement.textContent).not.toContain("...");
    });

    it("should display the percentage if an activity is emitting progress", () => {
        const nameEl = de.query(By.css(".name"));

        testComponent.activity = new MockActivity("Test activity with progress subject", testComponent.progressSubj);
        fixture.detectChanges();

        expect(component.progress).toBe(0);
        expect(nameEl.nativeElement.textContent).toContain("(0%)");

        testComponent.progressSubj.next(50);
        fixture.detectChanges();

        expect(component.progress).toBe(50);
        expect(nameEl.nativeElement.textContent).toContain("(50%)");
    });

    it("should select the activity", () => {
        testComponent.selectSubj.next(testComponent.activity.id);
        fixture.detectChanges();

        expect(component.selected).toBeTruthy();
    });

    it("should flash the activity", () => {
        testComponent.flashSubj.next(testComponent.activity.id);
        fixture.detectChanges();

        expect(component.shouldFlash).toBeTruthy();
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

    it("should show subactivities when prompted and then hide them", () => {
        testComponent.activity = new MockActivity("Test activity with subtasks", testComponent.progressSubj, [
            new MockActivity("Subtask 1", new AsyncSubject()),
            new MockActivity("Subtask 2", new AsyncSubject()),
            new MockActivity("Subtask 3", new AsyncSubject()),
        ]);
        fixture.detectChanges();

        component.toggleExpand();
        fixture.detectChanges();

        let subs = de.queryAll(By.css("bl-activity-monitor-item"));
        expect(subs.length).toBe(3);

        component.toggleExpand();
        fixture.detectChanges();

        subs = de.queryAll(By.css("bl-activity-monitor-item"));
        expect(subs.length).toBe(0);
    });

    it("should show only ten activities at first, and then more if prompted", () => {
        testComponent.activity = new MockActivity("Test activity with subtasks", testComponent.progressSubj, [
            new MockActivity("Subtask 1", new AsyncSubject()),
            new MockActivity("Subtask 2", new AsyncSubject()),
            new MockActivity("Subtask 3", new AsyncSubject()),
            new MockActivity("Subtask 4", new AsyncSubject()),
            new MockActivity("Subtask 5", new AsyncSubject()),
            new MockActivity("Subtask 6", new AsyncSubject()),
            new MockActivity("Subtask 7", new AsyncSubject()),
            new MockActivity("Subtask 8", new AsyncSubject()),
            new MockActivity("Subtask 9", new AsyncSubject()),
            new MockActivity("Subtask 10", new AsyncSubject()),
            new MockActivity("Subtask 11", new AsyncSubject()),
        ]);

        fixture.detectChanges();

        component.toggleExpand();
        fixture.detectChanges();

        expect(component.subactivities.length).toBe(10);

        // show up to ten more (total 11 shown, which is all)
        component.showMore();
        fixture.detectChanges();

        expect(component.subactivities.length).toBe(11);

        // show more again (should stay at 11 with no error)
        component.showMore();
        fixture.detectChanges();

        expect(component.subactivities.length).toBe(11);

        // show ten fewer
        component.showLess();
        fixture.detectChanges();

        expect(component.subactivities.length).toBe(1);

        // show less again, expect to show zero subactivites and have the menu collapsed
        component.showLess();
        fixture.detectChanges();

        expect(component.subactivities.length).toBe(0);
        expect(component.showSubactivities).toBeFalsy();
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
});
