import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BoolPropertyComponent, TextPropertyComponent } from "@batch-flask/ui";
import { SubtaskInformation, Task, TaskState } from "app/models";
import { SubTaskPropertiesComponent } from "./sub-task-properties.component";

const task1 = new Task({
    commandLine: "echo master",
    multiInstanceSettings: {
        coordinationCommandLine: "echo coordinating",
        numberOfInstances: 7,
        commonResourceFiles: [] as any,
    },
});

const subtask1 = new SubtaskInformation({
    id: 1,
    exitCode: 0,
    previousState: TaskState.running,
    state: TaskState.completed,
});

const subtaskWithError = new SubtaskInformation({
    id: 1,
    exitCode: -29,
    previousState: TaskState.running,
    state: TaskState.completed,
    failureInfo: {
        code: "FOO",
        category: "User",
        details: [],
        message: "Some error",
    },
});

@Component({
    template: `<bl-sub-task-properties [task]="task" [parentTask]="parentTask"></bl-sub-task-properties>`,
})
class TestComponent {
    public task: SubtaskInformation = subtask1;
    public parentTask: Task = task1;
}

describe("SubTaskPropertiesComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [SubTaskPropertiesComponent, TestComponent, TextPropertyComponent, BoolPropertyComponent],
            schemas: [NO_ERRORS_SCHEMA],

        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-sub-task-properties"));
        fixture.detectChanges();
    });

    function getProperty(label: string): DebugElement {
        return de.query(By.css(`[label='${label}']`));
    }

    it("display ID", () => {
        const idEl = getProperty("ID");
        expect(idEl).not.toBeFalsy();
        expect(idEl.nativeElement.textContent).toContain(1);
    });

    it("display exit code", () => {
        const el = getProperty("Exit code");
        expect(el).not.toBeFalsy();
        expect(el.nativeElement.textContent).toContain(0);
    });

    it("display state", () => {
        const el = getProperty("State");
        expect(el).not.toBeFalsy();
        expect(el.nativeElement.textContent).toContain(TaskState.completed);
    });

    it("display previous state", () => {
        const el = getProperty("Previous State");
        expect(el).not.toBeFalsy();
        expect(el.nativeElement.textContent).toContain(TaskState.running);
    });

    it("display primary command line", () => {
        const el = getProperty("Primary command line");
        expect(el).not.toBeFalsy();
        expect(el.nativeElement.textContent).toContain("echo master");
    });

    it("display coordination command line", () => {
        const el = getProperty("Coordination command line");
        expect(el).not.toBeFalsy();
        expect(el.nativeElement.textContent).toContain("echo coordinating");
    });

    it("display number of sub tasks", () => {
        const el = getProperty("Number of instances");
        expect(el).not.toBeFalsy();
        expect(el.nativeElement.textContent).toContain("7");
    });

    it("doesn't show the failure info group if there isn't", () => {
        const el = de.query(By.css("bl-property-group[label='Failure info']"));
        expect(el).toBeFalsy();
    });

    it("shows the failure info group if there is an error", () => {
        testComponent.task = subtaskWithError;
        fixture.detectChanges();
        const el = de.query(By.css("bl-property-group[label='Failure info']"));
        expect(el).toBeFalsy();
    });
});
