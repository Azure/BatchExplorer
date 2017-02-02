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
        </bex-task-lifetime>
    `,
})
class TestComponent {
    public job = new Job({ id: "job-1", jobPreparationTask: { id: "task" } });
    public task: Task = new Task();
}

function createTask(state: string) {
    return new Task({
        state,
        creationTime: moment().subtract(28, "minutes").toDate(),
        executionInfo: {
            startTime: moment().subtract(25, "minutes").toDate(),
            endTime: moment().subtract(20, "minutes").toDate(),
            retryCount: 3,
        },
    });
}

describe("TaskLifetimeComponent", () => {
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
        fixture.detectChanges();
        stateLinks = de.queryAll(By.css(".state-link"));
    });

    it("should have 3 state links", () => {
        expect(stateLinks.length).toBe(3);
    });

    it("should only show 2 state link if job has not prep task", () => {
        testComponent.job = new Job({ id: "job-2" });
        fixture.detectChanges();
        stateLinks = de.queryAll(By.css(".state-link"));
        expect(stateLinks.length).toBe(2);
    });

    describe("when the state is active", () => {
        beforeEach(() => {
            testComponent.task = createTask(TaskState.active);
            fixture.detectChanges();
        });

        it("all the state links should be gray out", () => {
            expect(stateLinks[0].classes["locked"]).toBe(true, "Link between active - preparing");
            expect(stateLinks[1].classes["locked"]).toBe(true, "Link between preparing - running");
            expect(stateLinks[2].classes["locked"]).toBe(true, "Link between running - completed");
        });

        it("should show creation time", () => {
            expect(de.nativeElement.textContent).toContain("28 minutes ago");
        });

        it("should not show execution info", () => {
            expect(de.nativeElement.textContent).not.toContain("3 retries");
            expect(de.nativeElement.textContent).not.toContain("5m 00s"); // Running time
        });

        it("should not show completed info", () => {
            expect(de.nativeElement.textContent).not.toContain("20 minutes ago");
        });
    });

    describe("when the state is preparing", () => {
        beforeEach(() => {
            testComponent.task = createTask(TaskState.preparing);
            fixture.detectChanges();
        });

        it("1st state link should not be locked", () => {
            expect(stateLinks[0].classes["locked"]).toBe(false, "Link between active - preparing");
            expect(stateLinks[1].classes["locked"]).toBe(true, "Link between preparing - running");
            expect(stateLinks[2].classes["locked"]).toBe(true, "Link between running - completed");
        });

        it("should show creation time", () => {
            expect(de.nativeElement.textContent).toContain("28 minutes ago");
        });

        it("should not show execution info", () => {
            expect(de.nativeElement.textContent).not.toContain("3 retries");
            expect(de.nativeElement.textContent).not.toContain("5m 00s"); // Running time
        });

        it("should not show completed info", () => {
            expect(de.nativeElement.textContent).not.toContain("20 minutes ago");
        });
    });

    describe("when the state is running", () => {
        beforeEach(() => {
            testComponent.task = createTask(TaskState.running);
            fixture.detectChanges();
        });

        it("1st 2 state link should not be locked", () => {
            expect(stateLinks[0].classes["locked"]).toBe(false, "Link between active - preparing");
            expect(stateLinks[1].classes["locked"]).toBe(false, "Link between preparing - running");
            expect(stateLinks[2].classes["locked"]).toBe(true, "Link between running - completed");
        });

        it("should show creation time", () => {
            expect(de.nativeElement.textContent).toContain("28 minutes ago");
        });

        it("should show execution info", () => {
            expect(de.nativeElement.textContent).toContain("3 retries");
            expect(de.nativeElement.textContent).toContain("5m 00s"); // Running time
        });

        it("should not show completed info", () => {
            expect(de.nativeElement.textContent).not.toContain("20 minutes ago");
        });
    });

    describe("when the state is completed", () => {
        beforeEach(() => {
            testComponent.task = createTask(TaskState.completed);
            fixture.detectChanges();
        });

        it("1st 2 state link should not be locked", () => {
            expect(stateLinks[0].classes["locked"]).toBe(false, "Link between active - preparing");
            expect(stateLinks[1].classes["locked"]).toBe(false, "Link between preparing - running");
            expect(stateLinks[2].classes["locked"]).toBe(false, "Link between running - completed");
        });

        it("should show creation time", () => {
            expect(de.nativeElement.textContent).toContain("28 minutes ago");
        });

        it("should show execution info", () => {
            expect(de.nativeElement.textContent).toContain("3 retries");
            expect(de.nativeElement.textContent).toContain("5m 00s"); // Running time
        });

        it("should not show completed info", () => {
            expect(de.nativeElement.textContent).toContain("20 minutes ago");
        });
    });
});
