import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { TaskDetailsModule } from "app/components/task/details";
import { TaskLifetimeStateComponent } from "app/components/task/details/task-lifetime";
import { TaskState } from "app/models";


@Component({
    template: `
        <bex-task-lifetime-state [state]="state" [currentState]="currentState">
            Additional content info
        </bex-task-lifetime-state>
    `,
})
class TestComponent {
    public state: TaskState = TaskState.running;
    public currentState: TaskState;
}

describe("TaskLifetimeStateComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: TaskLifetimeStateComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TaskDetailsModule],
            declarations: [TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bex-task-lifetime-state"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("should show the state name", () => {
        expect(de.nativeElement.textContent).toContain("Running");
    });

    it("should show the extra content", () => {
        expect(de.nativeElement.textContent).toContain("Additional content info");
    });

    describe("when the currentState is before", () => {
        beforeEach(() => {
            testComponent.currentState = TaskState.active;
            fixture.detectChanges();
        });

        it("should have the locked class", () => {
            expect(de.classes["locked"]).toBe(true);
            expect(de.classes["active"]).toBe(false);
            expect(de.classes["done"]).toBe(false);
        });

        it("should not have an icon", () => {
            expect(de.queryAll(By.css(".tile .fa")).length).toBe(0);
        });
    });

    describe("when the currentState is the same", () => {
        beforeEach(() => {
            testComponent.currentState = TaskState.running;
            fixture.detectChanges();
        });

        it("should have the active class", () => {
            expect(de.classes["locked"]).toBe(false);
            expect(de.classes["active"]).toBe(true);
            expect(de.classes["done"]).toBe(false);
        });

        it("should  have the play icon", () => {
            const icons = de.queryAll(By.css(".tile .fa"));
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
            expect(de.classes["locked"]).toBe(false);
            expect(de.classes["active"]).toBe(false);
            expect(de.classes["done"]).toBe(true);
        });

        it("should  have the done icon", () => {
            const icons = de.queryAll(By.css(".tile .fa"));
            expect(icons.length).toBe(1);
            expect(icons[0].nativeElement.classList).toContain("fa-check");
        });
    });
});

