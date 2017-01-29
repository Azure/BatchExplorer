import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { TaskDetailsModule, TaskErrorDisplayComponent } from "app/components/task/details";
import { Task, TaskState } from "app/models";
import { TaskService } from "app/services";
import * as Fixtures from "test/fixture";

@Component({
    template: `<bex-task-error-display jobId="job-1" [task]="task"></bex-task-error-display>`,
})
class TestTaskErrorDisplayComponent {
    public task: Task;
}

describe("TaskErrorDisplayComponent", () => {
    let fixture: ComponentFixture<TestTaskErrorDisplayComponent>;
    let testComponent: TestTaskErrorDisplayComponent;
    let component: TaskErrorDisplayComponent;
    let accountServiceSpy: any;

    beforeEach(() => {
        accountServiceSpy = {
            currentAccount: Observable.of(Fixtures.account.create()),
        };
        TestBed.configureTestingModule({
            imports: [TaskDetailsModule],
            declarations: [TestTaskErrorDisplayComponent],
            providers: [
                { provide: TaskService, useValue: null },
            ],
        });
        fixture = TestBed.createComponent(TestTaskErrorDisplayComponent);
        testComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.css("bex-task-error-display")).componentInstance;
        fixture.detectChanges();
    });

    describe("when there is no error", () => {
        it("should not show anything", () => {
            expect(fixture.debugElement.query(By.css("bex-banner"))).toBeNull();
        });
    });

    describe("when task return non zero exit code", () => {
        beforeEach(() => {
            testComponent.task = new Task({
                state: TaskState.completed,
                executionInfo: {
                    exitCode: 1,
                },
            });
            fixture.detectChanges();
        });

        it("should have a failure exit code error", () => {
            expect(component.hasCompleted).toBe(true);
            expect(component.hasFailureExitCode).toBe(true);
        });

        it("should show 1 bex banner", () => {
            expect(fixture.debugElement.queryAll(By.css("bex-banner")).length).toBe(1);
        });

        it("Should show the code and message", () => {
            const banner = fixture.debugElement.query(By.css("bex-banner"));
            expect(banner.nativeElement.textContent).toContain("ask completed with exit code '1'");
        });

        it("should propose increase quota as a first fix", () => {
            const banner = fixture.debugElement.query(By.css("bex-banner")).componentInstance;
            expect(banner.fixMessage).toContain("Rerun task");
        });
    });
});
