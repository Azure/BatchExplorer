import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import { ActivityMonitorFooterItemComponent } from "@batch-flask/ui/activity-monitor";
import { AsyncSubject, BehaviorSubject } from "rxjs";

@Component({
    template: `
        <bl-activity-monitor-footer-item [activity]=activity>
        </bl-activity-monitor-footer-item>
    `,
})
class TestComponent {
    public subj: BehaviorSubject<any>;
    public activity: MockActivity;

    constructor() {
        this.subj = new BehaviorSubject(null);
        this.activity = new MockActivity("Test activity", this.subj);
    }
}

class MockActivity {
    public name: string;
    public progress: BehaviorSubject<number>;

    constructor(n: string, p: BehaviorSubject<number>) {
        this.name = n;
        this.progress = p;
    }
}

fdescribe("ActivityMonitorFooterItemComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let component: ActivityMonitorFooterItemComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule],
            declarations: [ActivityMonitorFooterItemComponent, TestComponent],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-activity-monitor-footer-item"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("should display the activity name", () => {
        const nameEl = de.query(By.css(".name"));

        expect(nameEl.nativeElement.textContent).toContain("Test activity");
    });

    it("should not truncate the activity name if it is short enough to fit", () => {
        const nameEl = de.query(By.css(".name"));
        expect(nameEl.nativeElement.offsetWidth).toBe(nameEl.nativeElement.scrollWidth);
    });

    it("should truncate the activity name if it is too long to fit", () => {
        testComponent.activity = new MockActivity(
            "loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong name",
            testComponent.subj,
        );
        fixture.detectChanges();

        const nameEl = de.query(By.css(".name"));
        expect(nameEl.nativeElement.offsetWidth < nameEl.nativeElement.scrollWidth).toBe(true);
    });

    it("should display the percentage if an activity is emitting progress", () => {
        const progressEl = de.query(By.css(".progress-percent"));

        const progressSubj = new BehaviorSubject(0);

        testComponent.activity = new MockActivity("Test activity with progress subject", progressSubj);
        fixture.detectChanges();

        expect(component.progress).toBe(0);
        expect(progressEl.nativeElement.textContent).toContain("(0%)");

        progressSubj.next(50);
        fixture.detectChanges();

        expect(component.progress).toBe(50);
        expect(progressEl.nativeElement.textContent).toContain("(50%)");
    });
});
