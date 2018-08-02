import { Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { List } from "immutable";
import { Observable } from "rxjs";

import { I18nTestingModule } from "@batch-flask/core/testing";
import { ContextMenuService, I18nUIModule } from "@batch-flask/ui";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { Task, TaskState } from "app/models";
import { TaskService } from "app/services";
import * as Fixtures from "test/fixture";
import { NoItemMockComponent, TableTestingModule } from "test/utils/mocks/components";
import { TaskDependencyBrowserComponent } from "./task-dependency-browser.component";

const taskMap: Map<string, Task> = new Map()
    .set("1", new Task({ id: "1", dependsOn: { taskIds: ["1", "2"] } } as any))
    .set("2", new Task({ id: "2", dependsOn: { taskIds: ["3", "4", "5"] } } as any));

@Component({
    template: `<bl-task-dependency-browser [jobId]="jobId" [task]="task"></bl-task-dependency-browser>`,
})
class TestComponent {
    public jobId = "job-id-1";

    public task: Task;
}

describe("TaskDependenciesComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: TaskDependencyBrowserComponent;
    let taskServiceSpy: any;

    beforeEach(() => {
        taskServiceSpy = {
            getMultiple: jasmine
                .createSpy("getMultipleTasks").and
                .callFake((jobid: string, taskIds: string[], properties?: string) => {

                    const result = List<Task>(taskIds.map(id => {
                        return taskMap.get(id) || Fixtures.task.create({ id: id });
                    }));

                    return of(result);
                }),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, TableTestingModule, I18nTestingModule, I18nUIModule],
            declarations: [
                TestComponent, NoItemMockComponent, TaskDependencyBrowserComponent,
            ],
            providers: [
                { provide: TaskService, useValue: taskServiceSpy },
                { provide: ContextMenuService, useValue: null },
                { provide: BreadcrumbService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        testComponent.task = Fixtures.task.create();
        component = fixture.debugElement.query(By.css("bl-task-dependency-browser")).componentInstance;
        fixture.detectChanges();
    });

    describe("when task has no dependencies", () => {
        it("should show no item error", () => {
            const container = fixture.debugElement.query(By.css("bl-no-item"));
            expect(container.nativeElement.textContent).toContain("task-dependency-browser.no-dependency");
            expect(container).toBeVisible();
        });

        it("no dependencies should have been found", () => {
            expect(component.dependentIds.length).toBe(0);
            expect(component.dependencies.size).toBe(0);
        });
    });

    describe("when task depends on taskId array only", () => {
        beforeEach(() => {
            testComponent.task = new Task({
                id: "2001",
                state: TaskState.completed,
                dependsOn: {
                    taskIds: ["1", "2", "3"],
                },
            } as any);

            fixture.detectChanges();
        });

        it("should not show no item error", () => {
            expect(fixture.debugElement.query(By.css(".no-item-message"))).toBe(null);
        });

        it("shoud have 3 dependent task id's", () => {
            expect(component.dependentIds.length).toBe(3);
            expect(component.dependencies.size).toBe(3);
        });
    });

    describe("when task depends on taskIdRanges array only", () => {
        beforeEach(() => {
            testComponent.task = new Task({
                id: "2001",
                state: TaskState.completed,
                dependsOn: {
                    taskIdRanges: [{ start: 1, end: 5 }, { start: 10, end: 12 }],
                },
            } as any);

            fixture.detectChanges();
        });

        it("shoud have 8 dependent task id's", () => {
            expect(component.dependentIds.length).toBe(8);
            expect(component.dependencies.size).toBe(8);
        });
    });

    describe("when task depends on both taskId and taskIdRanges arrays", () => {
        beforeEach(() => {
            testComponent.task = new Task({
                id: "2001",
                state: TaskState.completed,
                dependsOn: {
                    taskIds: ["1"],
                    taskIdRanges: [{ start: 1, end: 5 }],
                },
            } as any);

            fixture.detectChanges();
        });

        it("shoud have 6 dependent task id's", () => {
            expect(component.dependentIds.length).toBe(6);
            expect(component.dependencies.size).toBe(6);
        });
    });

    describe("more than 20 dependencies enables load more", () => {
        beforeEach(() => {
            testComponent.task = new Task({
                id: "2001",
                state: TaskState.completed,
                dependsOn: {
                    taskIdRanges: [{ start: 1, end: 25 }],
                },
            } as any);

            fixture.detectChanges();
        });
    });

    describe("correctly decorates dependsOn of returned dependency", () => {
        beforeEach(() => {
            testComponent.task = new Task({
                id: "2001",
                state: TaskState.completed,
                dependsOn: {
                    taskIds: ["1", "2", "3"],
                },
            } as any);

            fixture.detectChanges();
        });

        it("shoud have 3 dependencies", () => {
            expect(component.dependentIds.length).toBe(3);
            expect(component.dependencies.size).toBe(3);
        });

        it("dependsOn property is correct", () => {
            const dependencies = component.dependencies.toJS();
            expect(dependencies[0].dependsOn).toBe("1,2");
            expect(dependencies[1].dependsOn).toBe("3 tasks");
            expect(dependencies[2].dependsOn).toBe("No tasks");
        });
    });
});
