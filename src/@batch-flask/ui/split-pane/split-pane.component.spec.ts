import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { mousedown } from "test/utils/helpers";
import { SplitPaneComponent, SplitPaneConfig } from "./split-pane.component";
import { SplitSeparatorComponent } from "./split-separator";

@Component({
    template: `
        <div style="width: 600px; height: 300px">
            <bl-split-pane [config]="config">
                <div blFirstPane>
                    First content
                </div>
                <div blSecondPane>
                    Second content
                </div>
            </bl-split-pane>
        </div>
    `,
})
class TestComponent {
    public config: SplitPaneConfig = {
        firstPane: {
            minSize: 50,
        },
        secondPane: {
            minSize: 60,
        },
    };
}

describe("SplitPaneComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: SplitPaneComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [SplitPaneComponent, SplitSeparatorComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-split-pane"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    function getPanels() {
        return {
            firstPane: de.query(By.css(".first-pane-container")),
            secondPane: de.query(By.css(".second-pane-container")),
        };
    }

    it("split panes equally when no default size", () => {
        const { firstPane, secondPane } = getPanels();

        expect(firstPane.nativeElement.getBoundingClientRect().width).toBe(299.5);
        expect(secondPane.nativeElement.getBoundingClientRect().width).toBe(299.5);

        expect(de.nativeElement.textContent).toContain("First content");
        expect(de.nativeElement.textContent).toContain("Second content");
    });

    it("shows only second pane when first is hidden", async () => {
        testComponent.config = {
            firstPane: {
                hidden: true,
            },
        };
        fixture.detectChanges();
        await fixture.whenStable();
        const { firstPane, secondPane } = getPanels();

        expect(firstPane).toBeFalsy();
        expect(secondPane.nativeElement.getBoundingClientRect().width).toBe(600);
        expect(de.nativeElement.textContent).not.toContain("First content");
        expect(de.nativeElement.textContent).toContain("Second content");
    });

    it("set first pane size when separator has a default position", () => {
        testComponent.config = {
            initialDividerPosition: 100,
        };
        fixture.detectChanges();
        const { firstPane, secondPane } = getPanels();

        expect(firstPane.nativeElement.getBoundingClientRect().width).toBe(100);
        expect(secondPane.nativeElement.getBoundingClientRect().width).toBe(499);

        expect(de.nativeElement.textContent).toContain("First content");
        expect(de.nativeElement.textContent).toContain("Second content");
    });

    it("set second pane size when separator has a default position(negative)", () => {
        testComponent.config = {
            initialDividerPosition: -150,
        };
        fixture.detectChanges();
        const { firstPane, secondPane } = getPanels();

        expect(firstPane.nativeElement.getBoundingClientRect().width).toBe(449);
        expect(secondPane.nativeElement.getBoundingClientRect().width).toBe(150);

        expect(de.nativeElement.textContent).toContain("First content");
        expect(de.nativeElement.textContent).toContain("Second content");
    });

    it("should move divider when clicking and dragging around", () => {
        const separators = de.queryAll(By.css(".separator-hitbox"));
        mousedown(separators[0]);
        const initial = separators[0].nativeElement.getBoundingClientRect().left;
        fixture.detectChanges();

        const event: MouseEvent = new MouseEvent("mousemove", {
            clientX: initial + 50,
        });
        component.onMousemove(event);
        fixture.detectChanges();

        const { firstPane, secondPane } = getPanels();
        expect(firstPane.nativeElement.getBoundingClientRect().width).toBe(349);
        expect(secondPane.nativeElement.getBoundingClientRect().width).toBe(250);
    });
});
