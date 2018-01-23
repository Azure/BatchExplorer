import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { NodeService } from "app/services";
import * as Fixtures from "test/fixture";
import { click, rightClick } from "test/utils/helpers";
import { ContextMenuServiceMock } from "test/utils/mocks";
import { HeatmapColor } from "../heatmap-color";
import { NodesHeatmapLegendComponent } from "./nodes-heatmap-legend.component";

const stateTree = [
    { state: "idle", color: "#aaaaaa" },
    { state: "running", color: "#888888" },
    {
        category: "transition", label: "Transition states", color: "#777777", states: [
            { state: "rebooting", color: "#aaa111" },
            { state: "starting", color: "#aaa222" },
        ],
    },
    {
        category: "error", label: "Error states", color: "#5555555", states: [
            { state: "starttaskfailed", color: "#bbb111" },
            { state: "unusable", color: "#bbb222" },
        ],
    },
];

describe("NodesHeatmapLegendComponent", () => {
    let fixture: ComponentFixture<NodesHeatmapLegendComponent>;
    let component: NodesHeatmapLegendComponent;
    let colors: HeatmapColor;
    let selectedStateSpy: jasmine.Spy;
    let contextMenuService: ContextMenuServiceMock;

    beforeEach(() => {
        contextMenuService = new ContextMenuServiceMock();
        TestBed.configureTestingModule({
            declarations: [NodesHeatmapLegendComponent],
            providers: [
                { provide: "StateTree", useValue: stateTree },
                { provide: NodeService, useValue: null },
                contextMenuService.asProvider(),
            ],
        });

        fixture = TestBed.createComponent(NodesHeatmapLegendComponent);
        component = fixture.componentInstance;
        component.pool = Fixtures.pool.create();
        colors = new HeatmapColor(stateTree as any);
        component.colors = colors;

        selectedStateSpy = jasmine.createSpy("selectedStateSpy");
        component.selectedStateChange.subscribe(selectedStateSpy);
        fixture.detectChanges();
    });

    it("should show all states", () => {
        const stateEls = fixture.debugElement.queryAll(By.css(".legend-item.state"));
        expect(stateEls.length).toBe(2);
        expect(stateEls[0].nativeElement.textContent).toContain("idle");
        expect(stateEls[1].nativeElement.textContent).toContain("running");
    });

    it("should show all categories", () => {
        const categories = fixture.debugElement.queryAll(By.css(".legend-item.category"));
        expect(categories.length).toBe(2);
        expect(categories[0].nativeElement.textContent).toContain("Transition states");
        expect(categories[1].nativeElement.textContent).toContain("Error states");
    });

    it("should show all substates", () => {
        const categories = fixture.debugElement.queryAll(By.css(".legend-subitem.state"));
        expect(categories.length).toBe(4);
        expect(categories[0].nativeElement.textContent).toContain("rebooting");
        expect(categories[1].nativeElement.textContent).toContain("starting");
        expect(categories[2].nativeElement.textContent).toContain("starttaskfailed");
        expect(categories[3].nativeElement.textContent).toContain("unusable");
    });

    it("should set the colors correctly", () => {
        const stateEls = fixture.debugElement.queryAll(By.css(".legend-item.state .color"));
        const bgColor1 = stateEls[0].nativeElement.style.backgroundColor;
        expect(bgColor1).toBe("rgb(170, 170, 170)"); // Angular convert hex to rgb

        const categories = fixture.debugElement.queryAll(By.css(".legend-item.category .color"));
        const bgColor2 = categories[0].nativeElement.style.backgroundColor;
        expect(bgColor2).toBe("rgb(119, 119, 119)");
    });

    it("should trigger event when clicking on a label", () => {
        const stateEls = fixture.debugElement.queryAll(By.css(".legend-item.state"));
        click(stateEls[0]);
        expect(selectedStateSpy).toHaveBeenCalledOnce();
        expect(selectedStateSpy).toHaveBeenCalledWith("idle");
        fixture.detectChanges();
        expect(stateEls[0].classes["highlighted"]).toBe(true);
    });

    it("clicking on the selected state should unselect", () => {
        component.highlightedState = "idle";
        fixture.detectChanges();
        const stateEls = fixture.debugElement.queryAll(By.css(".legend-item.state"));
        expect(stateEls[0].classes["highlighted"]).toBe(true, "Should be highlited to start with");

        click(stateEls[0]);
        expect(selectedStateSpy).toHaveBeenCalledOnce();
        expect(selectedStateSpy).toHaveBeenCalledWith(null);
        fixture.detectChanges();
        expect(stateEls[0].classes["highlighted"]).toBe(false, "Should not be highlighted anymore");
    });

    it("should show context menu when right clicking on a state", () => {
        const stateEls = fixture.debugElement.queryAll(By.css(".legend-item.state"));
        rightClick(stateEls[0]);

        expect(contextMenuService.openMenu).toHaveBeenCalledOnce();
    });
});
