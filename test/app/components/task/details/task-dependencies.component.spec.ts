import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { TaskDependenciesComponent, TaskDetailsModule } from "app/components/task/details";
import { Task, TaskState } from "app/models";
import { TaskService } from "app/services";
import * as Fixtures from "test/fixture";

@Component({
    template: `<bex-task-dependencies [jobId]="job-id-1" [task]="task"></bex-task-dependencies>`,
})
class TestTaskDependenciesComponent {
    public task: Task;
}

fdescribe("TaskDependenciesComponent", () => {
    let fixture: ComponentFixture<TestTaskDependenciesComponent>;
    let testComponent: TestTaskDependenciesComponent;
    let component: TaskDependenciesComponent;
    let taskServiceSpy: any;

    beforeEach(() => {
        taskServiceSpy = {
            getMultiple: Observable.of(Fixtures.task.create()),
        };
        TestBed.configureTestingModule({
            imports: [TaskDetailsModule],
            declarations: [TestTaskDependenciesComponent],
            providers: [
                { provide: TaskService, useValue: null },
            ],
        });
        fixture = TestBed.createComponent(TestTaskDependenciesComponent);
        testComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.css("bex-task-dependencies")).componentInstance;
        fixture.detectChanges();
    });

    describe("when task has no dependencies", () => {
        it("should show no item error", () => {
            const container = fixture.debugElement.query(By.css("bex-no-item"));
            expect(container.nativeElement.textContent).toContain("This task contains no dependent tasks");
            expect(container).toBeVisible();
        });

        it("no dependencies should have been found", () => {
            expect(component.dependentIds.length).toBe(0);
            expect(component.dependencies.value.length).toBe(0);
            expect(component.loadingMore).toBe(false);
            expect(component.hasMore).toBe(false);
        });
    });

    describe("when task depends on taskId array only", () => {
        beforeEach(() => {
            testComponent.task = new Task({
                state: TaskState.completed,
                dependsOn: {
                    taskIds: ["1", "2", "3"],
                },
            });

            fixture.detectChanges();
        });

        // it("should not show no item error", () => {
        //     expect(fixture.debugElement.query(By.css("bex-no-item"))).toBeNull();
        // });

        it("shoud have 3 dependent task id's", () => {
            expect(component.dependentIds.length).toBe(3);
            expect(component.dependencies.value.length).toBe(3);
        });

        // it("should not show load more", () => {
        //     expect(component.loadingMore).toBe(false);
        //     expect(component.hasMore).toBe(false);
        // });
    });
});
