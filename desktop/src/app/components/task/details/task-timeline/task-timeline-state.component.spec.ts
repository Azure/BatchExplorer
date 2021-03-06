import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { TaskTimelineStateComponent } from "app/components/task/details/task-timeline";
import { TaskState } from "app/models";

@Component({
    template: `
        <bl-task-timeline-state [state]="state" [currentState]="currentState" [error]="error">
            Additional content info
        </bl-task-timeline-state>
    `,
})
class TaskTimelineStateMockComponent {
    public state: TaskState = TaskState.running;
    public currentState: TaskState;
    public error = false;
}

describe("TaskTimelineStateComponent", () => {
    let fixture: ComponentFixture<TaskTimelineStateMockComponent>;
    let testComponent: TaskTimelineStateMockComponent;
    let debugElement: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TaskTimelineStateComponent, TaskTimelineStateMockComponent],
        });

        fixture = TestBed.createComponent(TaskTimelineStateMockComponent);
        testComponent = fixture.componentInstance;
        debugElement = fixture.debugElement.query(By.css("bl-task-timeline-state"));
        fixture.detectChanges();
    });

    it("should show the state name", () => {
        expect(debugElement.nativeElement.textContent).toContain("Running");
    });

    it("should show the extra content", () => {
        expect(debugElement.nativeElement.textContent).toContain("Additional content info");
    });

    describe("when the currentState is before", () => {
        beforeEach(() => {
            testComponent.currentState = TaskState.active;
            fixture.detectChanges();
        });

        it("should have the locked class", () => {
            expect(debugElement.classes["locked"]).toBe(true);
            expect(debugElement.classes["active"]).toBe(false);
            expect(debugElement.classes["done"]).toBe(false);
            expect(debugElement.classes["error"]).toBe(false);
        });

        it("should not have an icon", () => {
            expect(debugElement.queryAll(By.css(".tile .fa")).length).toBe(0);
        });
    });

    describe("when the currentState is the same", () => {
        beforeEach(() => {
            testComponent.currentState = TaskState.running;
            fixture.detectChanges();
        });

        it("should have the active class", () => {
            expect(debugElement.classes["locked"]).toBe(false);
            expect(debugElement.classes["active"]).toBe(true);
            expect(debugElement.classes["done"]).toBe(false);
            expect(debugElement.classes["error"]).toBe(false);
        });

        it("should  have the play icon", () => {
            const icons = debugElement.queryAll(By.css(".tile .fa"));
            expect(icons.length).toBe(1);
            expect(icons[0].nativeElement.classList).toContain("fa-play");
        });
    });

    describe("when the currentState is the after", () => {
        beforeEach(() => {
            testComponent.currentState = TaskState.completed;
            fixture.detectChanges();
        });

        it("should have the active class", () => {
            expect(debugElement.classes["locked"]).toBe(false);
            expect(debugElement.classes["active"]).toBe(false);
            expect(debugElement.classes["done"]).toBe(true);
            expect(debugElement.classes["error"]).toBe(false);
        });

        it("should  have the done icon", () => {
            const icons = debugElement.queryAll(By.css(".tile .fa"));
            expect(icons.length).toBe(1);
            expect(icons[0].nativeElement.classList).toContain("fa-check");
        });
    });

    describe("when there is an error", () => {
        beforeEach(() => {
            testComponent.currentState = TaskState.completed;
            testComponent.error = true;
            fixture.detectChanges();
        });

        it("should have the active class", () => {
            expect(debugElement.classes["locked"]).toBe(false);
            expect(debugElement.classes["active"]).toBe(false);
            expect(debugElement.classes["done"]).toBe(true);
            expect(debugElement.classes["error"]).toBe(true);
        });

        it("should have the warning icon", () => {
            const icons = debugElement.queryAll(By.css(".tile .fa"));
            expect(icons.length).toBe(1);
            expect(icons[0].nativeElement.classList).toContain("fa-exclamation-triangle");
        });
    });
});
