import { ComponentFixture, TestBed, fakeAsync, inject, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import { Subject } from "rxjs";

import {
    BackgroundTaskModule, BackgroundTaskService, BackgroundTaskTrackerComponent,
} from "@batch-flask/ui/background-task";

describe("BackgroundTaskTrackerComponent", () => {
    let fixture: ComponentFixture<BackgroundTaskTrackerComponent>;
    let taskManager: BackgroundTaskService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule, BackgroundTaskModule],
            declarations: [
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(BackgroundTaskTrackerComponent);
        fixture.detectChanges();
    });

    beforeEach(inject([BackgroundTaskService], (d: BackgroundTaskService) => {
        taskManager = d;
    }));

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

        const obs1 = new Subject();
        const obs2 = new Subject();

        // Add 1 task
        taskManager.startTask("Task1", () => obs1);
        fixture.detectChanges();
        expect(dropdownBtnEl.nativeElement.textContent).not.toContain(noTaskMessage);

        // Add a 2nd task
        taskManager.startTask("Task2", () => obs2);
        fixture.detectChanges();

        expect(dropdownBtnEl.nativeElement.textContent).not.toContain(noTaskMessage);
        expect(dropdownBtnEl.query(By.css("bl-background-task-tracker-item"))).not.toBeNull();

        const otherTaskCountel = dropdownBtnEl.query(By.css(".other-task-count"));
        expect(otherTaskCountel).not.toBeNull();
        expect(otherTaskCountel.nativeElement.textContent).toContain("+1");

        expect(dropdownBtnEl.nativeElement.textContent).not.toContain(noTaskMessage);

        obs1.complete();
        obs2.complete();
        tick(1000);
        fixture.detectChanges();
        expect(dropdownBtnEl.nativeElement.textContent).toContain(noTaskMessage);
    }));
});
