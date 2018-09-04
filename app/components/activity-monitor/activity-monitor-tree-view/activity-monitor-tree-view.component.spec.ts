import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import { ActivityService, ActivityStatus, ButtonsModule } from "@batch-flask/ui";
import { FocusSectionModule } from "@batch-flask/ui/focus-section";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";
import { ActivityMonitorItemComponent } from "../activity-monitor-item";
import { ActivityMonitorItemActionComponent } from "../activity-monitor-item/activity-monitor-item-action";
import { ActivityMonitorTreeViewComponent } from "./activity-monitor-tree-view.component";

@Component({
    template: `
    <bl-activity-monitor-tree-view
        [activities]="runningActivities"
        name="Running Activities"
    ></bl-activity-monitor-tree-view>
    `,
})
class TestComponent {
    public runningActivities: MockActivity[];

    constructor() {
        this.runningActivities = [
            new MockActivity("Test activity1", new AsyncSubject()),
            new MockActivity("Test activity2", new AsyncSubject()),
            new MockActivity("Test activity3", new AsyncSubject()),
        ];
    }
}

class MockActivity {
    public static idCounter = 0;

    public name: string;
    public progress: Observable<number>;
    public subactivities: MockActivity[];
    public id: number;
    public statusSubject: BehaviorSubject<ActivityStatus>;
    public error: string;
    public isComplete?: boolean;

    constructor(n: string, p: Observable<number>, subs: MockActivity[] = []) {
        this.id = MockActivity.idCounter++;
        this.name = n;
        this.progress = p;
        this.subactivities = subs;
        this.statusSubject = new BehaviorSubject(ActivityStatus.Pending);
        this.error = "";
    }
}

describe("ActivityMonitorTreeViewComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let component: ActivityMonitorTreeViewComponent;

    let activityServiceSpy;

    beforeEach(() => {
        activityServiceSpy = {
            cancel: jasmine.createSpy("cancel"),
            rerun: jasmine.createSpy("rerun"),
        };

        TestBed.configureTestingModule({
            imports: [ButtonsModule, MaterialModule, FocusSectionModule],
            declarations: [
                TestComponent, ActivityMonitorTreeViewComponent,
                ActivityMonitorItemComponent, ActivityMonitorItemActionComponent,
            ],
            providers: [
                { provide: ActivityService, useValue: activityServiceSpy },
            ],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-activity-monitor-tree-view"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("should display the tree view's name", () => {
        const nameEl = de.query(By.css(".name"));

        expect(nameEl.nativeElement.textContent).toContain("Running Activities");
    });

    it("should not expand a row with no children", () => {
        // we initially created a list of activities with three elements, in the TestComponent constructor
        expect(component.treeRows.length).toBe(3);

        const queryRow = component.treeRows[0];
        expect(component.isExpanded(queryRow.id)).toBeFalsy();
        component.toggleRowExpand(queryRow);
        fixture.detectChanges();

        expect(component.isExpanded(queryRow.id)).toBeFalsy();
        expect(component.treeRows.length).toBe(3);
    });

    it("should expand and collapse a row with children", () => {
        testComponent.runningActivities = [
            new MockActivity("Test activity1", new AsyncSubject(), [
                new MockActivity("Sub activity1", new AsyncSubject()),
                new MockActivity("Sub activity2", new AsyncSubject()),
            ]),
            new MockActivity("Test activity2", new AsyncSubject()),
        ];
        fixture.detectChanges();
        expect(component.treeRows.length).toBe(2);

        const queryRow = component.treeRows[0];
        expect(component.isExpanded(queryRow.id)).toBeFalsy();
        component.toggleRowExpand(queryRow);
        fixture.detectChanges();

        expect(component.isExpanded(queryRow.id)).toBeTruthy();
        expect(component.treeRows.length).toBe(4);

        component.toggleRowExpand(queryRow);
        fixture.detectChanges();

        expect(component.isExpanded(queryRow.id)).toBeFalsy();
        expect(component.treeRows.length).toBe(2);
    });

    it("should focus the activity", () => {
        const queryRow = component.treeRows[1];
        component.focusRow(queryRow);
        fixture.detectChanges();

        expect(component.focusedIndex).toBe(queryRow.index);
        expect(component.focusedAction).toBeFalsy();
    });

    it("should hover and unhover the activity", () => {
        const queryRow = component.treeRows[1];
        component.hoverRow(queryRow);
        fixture.detectChanges();

        expect(component.hoveredIndex).toBe(queryRow.index);

        component.clearHover();
        fixture.detectChanges();
        expect(component.hoveredIndex).toBe(-1);
    });

    it("should render the tree view properly for a complex set of activities", () => {
        testComponent.runningActivities = [
            new MockActivity("1", new AsyncSubject(), [
                new MockActivity("1.1", new AsyncSubject(), [
                    new MockActivity("1.1.1", new AsyncSubject()),
                ]),
                new MockActivity("1.2", new AsyncSubject(), [
                    new MockActivity("1.2.1", new AsyncSubject()),
                ]),
            ]),
            new MockActivity("2", new AsyncSubject(), [
                new MockActivity("2.1", new AsyncSubject()),
                new MockActivity("2.2", new AsyncSubject()),
                new MockActivity("2.3", new AsyncSubject()),
                new MockActivity("2.4", new AsyncSubject()),
            ]),
        ];
        fixture.detectChanges();

        expect(component.treeRows.length).toBe(2);

        // expand 1 and 1.2
        component.toggleRowExpand(component.treeRows[0]);
        component.toggleRowExpand(component.treeRows[2]);
        fixture.detectChanges();

        // expected expansion:
        // 1
        //   1.1
        //   1.2
        //     1.2.1
        // 2
        expect(component.treeRows.length).toBe(5);
        const expectedIndents = [0, 1, 1, 2, 0];
        component.treeRows.forEach((row, index) => {
            expect(row.indent).toBe(expectedIndents[index]);
        });
    });

    it("should test up and down arrow key navigation", () => {
        // focus the first row
        component.setFocus(true);
        component.focusRow(component.treeRows[0]);
        fixture.detectChanges();

        // test down arrow
        let keydown = new KeyboardEvent("ArrowDown", { code: "ArrowDown" });
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(1, "Down arrow should move focus down by one");
        expect(component.focusedAction).toBe(null);

        // test up arrow
        keydown = new KeyboardEvent("ArrowUp", { code: "ArrowUp" });
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(0, "Up arrow should move focus up by one");
        expect(component.focusedAction).toBe(null);

        // test that up arrow wraps around to bottom
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(2, "Up arrow should wrap around to bottom of list");
        expect(component.focusedAction).toBe(null);

        // test that down arrow wraps around to top
        keydown = new KeyboardEvent("ArrowDown", { code: "ArrowDown" });
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(0, "Down arrow should wrap around to top of list");
        expect(component.focusedAction).toBe(null);
    });

    it("should test right and left arrow key navigation", () => {
        testComponent.runningActivities = [
            new MockActivity("1", new AsyncSubject(), [
                new MockActivity("1.1", new AsyncSubject()),
                new MockActivity("1.2", new AsyncSubject()),
            ]),
        ];
        fixture.detectChanges();

        // focus the first row
        component.setFocus(true);
        component.focusRow(component.treeRows[0]);
        fixture.detectChanges();

        // test right arrow expands row with children
        let keydown = new KeyboardEvent("ArrowRight", { code: "ArrowRight" });
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(0, "Right arrow should expand and not change focus");
        expect(component.isExpanded(component.treeRows[0].id)).toBe(
            true, "Right arrow should expand a row with children",
        );

        // test right arrow focuses first of expanded row
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(1, "Right arrow should focus first of expanded row children");

        // test right arrow does nothing if pressed on row with no children
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(
            1, "Right arrow should do nothing if pressed on focused row with no children",
        );
        expect(component.isExpanded(component.treeRows[1].id)).toBe(false);

        // move down one row, still in children of activity 1
        keydown = new KeyboardEvent("ArrowDown", { code: "ArrowDown" });
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(2, "Down arrow should move down focus by 1");

        // test that left arrow jumps to immediate parent
        keydown = new KeyboardEvent("ArrowLeft", { code: "ArrowLeft" });
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(0, "Left arrow should jump focus to immediate parent");
        expect(component.isExpanded(component.treeRows[0].id)).toBe(true, "Left arrow should not collapse if moving");

        // test that left arrow collapses an expanded row
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(0, "Left arrow should collapse without changing focus");
        expect(component.isExpanded(component.treeRows[0].id)).toBe(false);

        // test that left arrow does nothing on a collapsed row with no parents
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(0, "Left arrow should do nothing if a row is collapse with no parents");
        expect(component.isExpanded(component.treeRows[0].id)).toBe(false);
    });

    it("should test space and enter key events", () => {
        testComponent.runningActivities = [
            new MockActivity("1", new AsyncSubject(), [
                new MockActivity("1.1", new AsyncSubject()),
            ]),
        ];
        fixture.detectChanges();

        // focus the first row
        component.setFocus(true);
        component.focusRow(component.treeRows[0]);
        fixture.detectChanges();

        // test spacebar expands a row with children
        let keydown = new KeyboardEvent("Space", { code: "Space" });
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(0, "Space should expand and not change focus");
        expect(component.isExpanded(component.treeRows[0].id)).toBe(
            true, "Space should expand a row with children",
        );

        // move down one
        component.focusedIndex++;
        fixture.detectChanges();

        // test spacebar does nothing to a row with no children
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(1, "Space should not change focus");
        expect(component.isExpanded(component.treeRows[1].id)).toBe(
            false, "Space should not expand a row without children",
        );

        // move up one
        component.focusedIndex--;
        fixture.detectChanges();

        // test spacebar collapses an expanded row
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(0, "Space should collapse and not change focus");
        expect(component.isExpanded(component.treeRows[0].id)).toBe(
            false, "Space should collapse an expanded row",
        );

        // test enter expands a row with children
        keydown = new KeyboardEvent("Enter", { code: "Enter" });
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(0, "Enter should expand and not change focus");
        expect(component.isExpanded(component.treeRows[0].id)).toBe(
            true, "Enter should expand a row with children",
        );

        // move down one
        component.focusedIndex++;
        fixture.detectChanges();

        // test enter does nothing to a row with no children
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(1, "Enter should not change focus");
        expect(component.isExpanded(component.treeRows[1].id)).toBe(
            false, "Enter should not expand a row without children",
        );

        // move up one
        component.focusedIndex--;
        fixture.detectChanges();

        // test enter collapses an expanded row
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedIndex).toBe(0, "Enter should collapse and not change focus");
        expect(component.isExpanded(component.treeRows[0].id)).toBe(
            false, "Enter should collapse an expanded row",
        );
    });

    it("should test tab events", () => {
        const activity = new MockActivity("1", new AsyncSubject());
        activity.isComplete = true;

        testComponent.runningActivities = [activity];
        fixture.detectChanges();

        // focus the first row
        component.setFocus(true);
        component.focusRow(component.treeRows[0]);
        fixture.detectChanges();

        expect(component.focusedAction).toBe(null);

        // test tab moves the selected action to the first action
        let keydown = new KeyboardEvent("Tab", { code: "Tab", shiftKey: false });
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedAction).toBe(0, "Tab should select the first action");

        // test shift-tab unselects all actions
        keydown = new KeyboardEvent("Tab", { code: "Tab", shiftKey: true });
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedAction).toBe(null, "Shift-Tab should unselect all actions");

        // test shift-tab does nothing if no action is selected
        component.handleKeyboardNavigation(keydown);
        fixture.detectChanges();
        expect(component.focusedAction).toBe(null, "Shift-Tab should do nothing if no acton is selected");
    });
});
