import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { ChartsModule, FormModule, SelectComponent, SelectModule } from "@batch-flask/ui";
import { Job, Task } from "app/models";
import { ThemeService } from "app/services";
import { List } from "immutable";
import { BehaviorSubject } from "rxjs";
import { TasksRunningTimeGraphComponent } from "./tasks-running-time-graph.component";

const task1 = new Task({
    id: "task-1",
    executionInfo: { startTime: new Date(2018, 1, 7), endTime: new Date(2018, 1, 8), exitCode: 0 } as any,
    nodeInfo: { nodeId: "node-2" } as any,
});

const task2 = new Task({
    id: "task-2",
    executionInfo: { startTime: new Date(2018, 1, 2), endTime: new Date(2018, 1, 4), exitCode: 1 } as any,
    nodeInfo: { nodeId: "node-1" } as any,
});

const taskWithoutStartTime = new Task({
    id: "task-no-start-time",
    executionInfo: { endTime: new Date(2018, 1, 5), exitCode: 1 } as any,
    nodeInfo: { nodeId: "node-1" } as any,
});

const taskWithoutNodeInfo = new Task({
    id: "task-no-start-time",
    executionInfo: { startTime: new Date(2018, 1, 3), endTime: new Date(2018, 1, 5), exitCode: 0 } as any,
});

@Component({
    template: `<bl-tasks-running-time-graph [job]="job" [tasks]="tasks"></bl-tasks-running-time-graph>`,
})
class TestComponent {
    public job = new Job({ id: "job-1" });
    public tasks = List([task1, task2, taskWithoutStartTime, taskWithoutNodeInfo]);
}

describe("TaskRuningTimeGraphComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TasksRunningTimeGraphComponent;
    let de: DebugElement;
    let themeServiceSpy;
    let sortSelect: SelectComponent;

    beforeEach(() => {
        themeServiceSpy = {
            currentTheme: new BehaviorSubject({
                danger: { main: "#ff0000" },
                success: { main: "#00ff00" },
            }),
        };
        TestBed.configureTestingModule({
            imports: [
                ChartsModule, SelectModule, ReactiveFormsModule, FormsModule, FormModule, RouterTestingModule,
            ],
            declarations: [TasksRunningTimeGraphComponent, TestComponent],
            providers: [
                { provide: ThemeService, useValue: themeServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-tasks-running-time-graph"));
        component = de.componentInstance;
        fixture.detectChanges();
        sortSelect = de.query(By.directive(SelectComponent)).componentInstance;

    });

    it("shows the sort options", () => {
        const options = sortSelect.options.toArray();
        expect(options.length).toEqual(4);
        expect(options[0].label).toEqual("Default");
        expect(options[1].label).toEqual("Start time");
        expect(options[2].label).toEqual("End time");
        expect(options[3].label).toEqual("Node");
    });

    it("shows datasets with default sorting", () => {
        expect(component.datasets).toEqual([
            {
                label: "Failed tasks",
                radius: 2,
                data: [
                    { x: 1, y: task2.runtime / 1000},
                    { x: 2, y: NaN }, // Missing startTime
                ],
            } as any,
            {
                label: "Succeeded tasks",
                data: [
                    { x: 0, y: task1.runtime / 1000},
                    { x: 3, y: taskWithoutNodeInfo.runtime / 1000},
                ],
            },
        ]);
    });

    it("sort by start time", () => {
        sortSelect.selectOption(sortSelect.options.toArray()[1]);
        fixture.detectChanges();

        expect(component.datasets).toEqual([
            {
                label: "Failed tasks",
                radius: 2,
                data: [
                    { x: 0, y: NaN }, // Missing startTime
                    { x: 1, y: task2.runtime / 1000 },
                ],
            } as any,
            {
                label: "Succeeded tasks",
                data: [
                    { x: 2, y: taskWithoutNodeInfo.runtime / 1000},
                    { x: 3, y: task1.runtime / 1000 },
                ],
            },
        ]);
    });

    it("sort by end time", () => {
        sortSelect.selectOption(sortSelect.options.toArray()[2]);
        fixture.detectChanges();

        expect(component.datasets).toEqual([
            {
                label: "Failed tasks",
                radius: 2,
                data: [
                    { x: 0, y: task2.runtime / 1000 },
                    { x: 1, y: NaN }, // Missing startTime
                ],
            } as any,
            {
                label: "Succeeded tasks",
                data: [
                    { x: 2, y: taskWithoutNodeInfo.runtime / 1000},
                    { x: 3, y: task1.runtime / 1000  },
                ],
            },
        ]);
    });

    it("sort by node id", () => {
        sortSelect.selectOption(sortSelect.options.toArray()[2]);
        fixture.detectChanges();

        expect(component.datasets).toEqual([
            {
                label: "Failed tasks",
                radius: 2,
                data: [
                    { x: 0, y: task2.runtime / 1000 },
                    { x: 1, y: NaN }, // Missing startTime
                ],
            } as any,
            {
                label: "Succeeded tasks",
                data: [
                    { x: 2, y: taskWithoutNodeInfo.runtime / 1000},
                    { x: 3, y: task1.runtime / 1000  },
                ],
            },
        ]);
    });
});
