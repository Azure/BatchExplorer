import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import {
    Activity,
    ActivityModule,
    ActivityMonitorFooterItemComponent,
} from "@batch-flask/ui/activity-monitor";
import { AsyncSubject, BehaviorSubject } from "rxjs";

@Component({
    template: `
        <bl-activity-monitor-footer-item [activity]=activity>
        </bl-activity-monitor-footer-item>
    `,
})
class TestComponent {
    public subj: BehaviorSubject<any>;
    public activity: Activity;

    constructor() {
        this.subj = new BehaviorSubject(null);
        this.activity = new Activity("Test activity", () => this.subj);
    }
}

describe("ActivityMonitorFooterItemComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let TestComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule, ActivityModule],
            declarations: [
            ],
        });

        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
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
