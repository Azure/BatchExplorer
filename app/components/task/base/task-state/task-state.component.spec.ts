import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { MatTooltipModule } from "@angular/material";
import { FailureInfo, Task, TaskState } from "app/models";
import { TaskStateComponent } from "./task-state.component";

@Component({
    template: `<bl-task-state [task]="task"></bl-task-state>`,
})
class TestComponent {
    public task: Task = new Task();
}

describe("TaskStateComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatTooltipModule],
            declarations: [TaskStateComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-task-state"));
        fixture.detectChanges();
    });

    it("it shows success when task is completed without error", () => {
        testComponent.task = new Task({
            state: TaskState.completed,
            executionInfo: {
                failureInfo: null,
            },
        } as any);
        fixture.detectChanges();
        expect(de.nativeElement.textContent).toContain("completed");
        const icon = de.query(By.css(".fa"));
        expect(icon).not.toBeFalsy();
        expect(icon.classes["fa-check"]).toBe(true);
        expect(icon.classes["fa-warning"]).toBe(false);
    });

    it("it shows error when task completed with failureInfo", () => {
        testComponent.task = new Task({
            state: TaskState.completed,
            executionInfo: {
                failureInfo: new FailureInfo({
                    code: "SomeError",
                    message: "Some stuff happened",
                }),
            },
        } as any);
        fixture.detectChanges();
        expect(de.nativeElement.textContent).toContain("completed");
        expect(de.nativeElement.textContent).toContain("(SomeError)");
        const icon = de.query(By.css(".fa"));
        expect(icon).not.toBeFalsy();
        expect(icon.classes["fa-check"]).toBe(false);
        expect(icon.classes["fa-warning"]).toBe(true);
    });

    it("it doesn't show icon when task active", () => {
        testComponent.task = new Task({
            state: TaskState.active,
        } as any);
        fixture.detectChanges();
        expect(de.nativeElement.textContent).toContain("active");
        const icon = de.query(By.css(".fa"));
        expect(icon).not.toBeFalsy();
        expect(icon.classes["fa-check"]).toBe(false);
        expect(icon.classes["fa-warning"]).toBe(false);
    });

    it("it doesn't show icon when task preparing", () => {
        testComponent.task = new Task({
            state: TaskState.preparing,
        } as any);
        fixture.detectChanges();
        expect(de.nativeElement.textContent).toContain("preparing");
        const icon = de.query(By.css(".fa"));
        expect(icon).not.toBeFalsy();
        expect(icon.classes["fa-check"]).toBe(false);
        expect(icon.classes["fa-warning"]).toBe(false);
    });

    it("it doesn't show icon when task running", () => {
        testComponent.task = new Task({
            state: TaskState.running,
        } as any);
        fixture.detectChanges();
        expect(de.nativeElement.textContent).toContain("running");
        const icon = de.query(By.css(".fa"));
        expect(icon).not.toBeFalsy();
        expect(icon.classes["fa-check"]).toBe(false);
        expect(icon.classes["fa-warning"]).toBe(false);
    });
});
