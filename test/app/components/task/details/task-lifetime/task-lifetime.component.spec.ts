import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import * as moment from "moment";

import { TaskDetailsModule } from "app/components/task/details";
import { TaskLifetimeComponent } from "app/components/task/details/task-lifetime";
import { Job, Task, TaskState } from "app/models";

@Component({
    template: `
        <bex-task-lifetime [job]="job" [task]="task">
            Additional content info
        </bex-task-lifetime-state>
    `,
})
class TestComponent {
    public job = new Job({ id: "job-1", jobPreparationTask: { id: "task" } });
    public task: Task;
}

function createTask(state: string) {
    return new Task({
        state: TaskState.active,
        creationTime: moment().subtract(28, "minutes").toDate(),
        executionInfo: {
            startTime:  moment().subtract(25, "minutes").toDate(),
            endTime:  moment().subtract(20, "minutes").toDate(),
            retryCount: 3,
        },
    });
}

fdescribe("TaskLifetimeComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: TaskLifetimeComponent;
    let de: DebugElement;
    let stateLinks: DebugElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TaskDetailsModule],
            declarations: [TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bex-task-lifetime"));
        component = de.componentInstance;
        stateLinks = de.queryAll(By.css(".state-link"));
        fixture.detectChanges();
    });

    it("should have 3 state links", () => {
        expect(stateLinks.length).toBe(3);
    });

    describe("when the state is active", () => {
        beforeEach(() => {
            testComponent.task = createTask(TaskState.active)
            fixture.detectChanges();
        });

        it("all the state links should be gray out", () => {
            expect(stateLinks[0].classes["locked"]).toBe(true);
            expect(stateLinks[1].classes["locked"]).toBe(true);
            expect(stateLinks[2].classes["locked"]).toBe(true);
        });

        it("should not show execution info", () => {
            expect(de.nativeElement.textContent).not.toContain("28 minutes ago");
            expect(de.nativeElement.textContent).not.toContain("3 retries"); // Should not show number of retries
            expect(de.nativeElement.textContent).not.toContain("20 minutes ago"); // End time should not be shown
        });
    });

});
