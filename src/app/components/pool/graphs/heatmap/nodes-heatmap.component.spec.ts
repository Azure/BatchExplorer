import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { I18nTestingModule, TelemetryTestingModule } from "@batch-flask/core/testing";
import { ActivityService, ClickableComponent, DialogService, WorkspaceService } from "@batch-flask/ui";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { Node, NodeState, Pool } from "app/models";
import { NodeService, PoolService } from "app/services";
import * as d3 from "d3";
import { List } from "immutable";
import * as Fixture from "test/fixture";
import { click, dblclick, rightClick } from "test/utils/helpers";
import { ContextMenuServiceMock, NotificationServiceMock } from "test/utils/mocks";
import { NodesHeatmapComponent, NodesHeatmapLegendComponent } from ".";

const legendWidth = 160;
const svgMargin = 4; // 2x2
const defaultRunningTasksCount = 2;
const defaultRunningTaskSlotsCount = 2;

@Component({
    template: `
        <div [style.width]="width" [style.height]="height" [style.position]="'relative'">
            <bl-nodes-heatmap [pool]="pool" [nodes]="nodes" [interactive]="interactive"></bl-nodes-heatmap>
        </div>
    `,
})
export class HeatmapMockComponent {
    public width = "400px";
    public height = "250px";
    public nodes: List<Node> = List([]);
    public pool = new Pool({ id: "pool-id", taskSlotsPerNode: 1 });
    public interactive = true;
}

describe("NodesHeatmapComponent", () => {
    let fixture: ComponentFixture<HeatmapMockComponent>;
    let testComponent: HeatmapMockComponent;
    let heatmap: NodesHeatmapComponent;
    let heatmapContainer: DebugElement;
    let svg: d3.Selection<any, any, any, any>;
    let contextMenuService: ContextMenuServiceMock;
    let routerSpy;
    let notificationService;
    beforeEach(() => {
        contextMenuService = new ContextMenuServiceMock();
        notificationService = new NotificationServiceMock();
        routerSpy = {
            navigate: jasmine.createSpy("router.navigate"),
        };
        TestBed.configureTestingModule({
            imports: [I18nTestingModule, TelemetryTestingModule],
            declarations: [
                HeatmapMockComponent, NodesHeatmapComponent, NodesHeatmapLegendComponent,
                ClickableComponent,
            ],
            providers: [
                { provide: NodeService, useValue: {} },
                { provide: PoolService, useValue: null },
                { provide: SidebarManager, useValue: {} },
                { provide: Router, useValue: routerSpy },
                { provide: DialogService, useValue: null },
                { provide: WorkspaceService, useValue: null },
                { provide: ActivityService, useValue: null },
                contextMenuService.asProvider(),
                notificationService.asProvider(),
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(HeatmapMockComponent);
        testComponent = fixture.componentInstance;
        heatmap = fixture.debugElement.query(By.css("bl-nodes-heatmap")).componentInstance;
        fixture.detectChanges();

        heatmapContainer = fixture.debugElement.query(By.css("bl-nodes-heatmap .heatmap-container"));
        svg = d3.select(heatmapContainer.nativeElement).select("svg");
        heatmap.containerSizeChanged();
    });

    it("Should have created the svg in the right dimensions", () => {
        expect(svg).not.toBeNull();

        expect(svg.attr("width")).toBe((400 - legendWidth - svgMargin).toString());
        expect(svg.attr("height")).toBe("250");
    });

    it("should reszize the svg when container width change", () => {
        testComponent.width = "800px";
        fixture.detectChanges();

        // Force notify because the element-reszize-detector is not instant
        heatmap.containerSizeChanged();
        expect(svg.attr("width")).toBe((800 - legendWidth - svgMargin).toString());
        expect(svg.attr("height")).toBe("250");
    });

    it("Should compute optimal tile dimensions for 1 tile(Max tile size)", () => {
        testComponent.nodes = List([
            Fixture.node.create({ state: NodeState.idle }),
        ]);
        fixture.detectChanges();
        expect(heatmap.dimensions.columns).toBe(1);
        expect(heatmap.dimensions.rows).toBe(1);
        expect(heatmap.dimensions.tileSize).toBe(100);
    });

    it("Should compute optimal tile dimensions for 4 tile", () => {
        testComponent.nodes = createNodes(4);
        fixture.detectChanges();
        expect(heatmap.dimensions.columns).toBe(2);
        expect(heatmap.dimensions.rows).toBe(2);
        expect(heatmap.dimensions.tileSize).toBe(100);
    });

    it("should create a tile for each node", () => {
        testComponent.nodes = createNodes(7);
        fixture.detectChanges();
        const tiles = svg.selectAll("g.node-group");
        expect(tiles.size()).toBe(7);
        const size = (heatmap.dimensions.tileSize - Math.ceil(heatmap.dimensions.tileSize / 20)).toString();
        tiles.each((d, i, groups) => {
            const group = d3.select(groups[i]);
            expect(group.attr("width")).toBe(size);
            expect(group.attr("height")).toBe(size);

            expect(group.selectAll("g.bg").size()).toBe(1, "Should only 1 background group");
            const bg = group.select("g.bg");

            expect(bg.selectAll("rect").size()).toBe(1, "Should only have 1 rect");
            const rect = bg.select("rect");
            expect(rect).not.toBeFalsy("Should have a rect in bg");
            expect(rect.attr("style")).toContain("fill: rgb(237, 238, 242);");
            expect(rect.attr("style")).toContain("stroke-width: 0;");
        });
    });

    it("should have title with number of tasks running on node", () => {
        const testTaskSlotsPerNode = 2;
        testComponent.nodes = createNodes(2);
        testComponent.pool = new Pool({ id: "pool-2", taskSlotsPerNode: testTaskSlotsPerNode });
        fixture.detectChanges();
        const tiles = svg.selectAll("g.node-group");
        tiles.each((d, i, groups) => {
            const group = d3.select(groups[i]);
            expect(group.selectAll("title").size()).toBe(1, "Should only 1 title element");
            const title = group.select("title");

            expect(title).not.toBeFalsy("Should have a rect in bg");
            expect(title.text()).toContain(
                `${defaultRunningTasksCount} tasks (${defaultRunningTaskSlotsCount}/${testTaskSlotsPerNode} slots) running on node (node-${i + 1})`
            );
        });
    });

    describe("Running task overlay", () => {
        it("when there is space should show 2 green stripes", () => {
            testComponent.nodes = createNodes(2);
            testComponent.pool = new Pool({ id: "pool-4", taskSlotsPerNode: 4 });
            fixture.detectChanges();
            const tiles = svg.selectAll("g.node-group");
            expect(tiles.size()).toBe(2);
            tiles.each((d, i, groups) => {
                const group = d3.select(groups[i]);
                const bg = group.select("g.taskslots");
                const taskRects = bg.selectAll("rect");
                expect(taskRects.size()).toBe(2, "Should have 2 rect");
                taskRects.each((d, i, rects) => {
                    const rect = d3.select(rects[i]);
                    expect(rect.attr("height")).not.toBe("0");
                    expect(rect.attr("style")).toContain("fill: rgb(56, 142, 60);");
                });
            });
        });

        it("when there is no space should combine green stripes", () => {
            testComponent.nodes = createNodes(2);
            testComponent.pool = new Pool({ id: "pool-100", taskSlotsPerNode: 300 });
            fixture.detectChanges();
            const tiles = svg.selectAll("g.node-group");
            expect(tiles.size()).toBe(2);
            tiles.each((d, i, groups) => {
                const group = d3.select(groups[i]);
                const bg = group.select("g.taskslots");
                const taskRects = bg.selectAll("rect");
                expect(taskRects.size()).toBe(1, "Should have only 1 rect");
                taskRects.each((d, i, rects) => {
                    const rect = d3.select(rects[i]);
                    expect(rect.attr("height")).not.toBe("0");
                    expect(rect.attr("style")).toContain("fill: rgb(56, 142, 60);");
                });
            });
        });
    });

    describe("Lowpri stipes overlay", () => {
        it("should use fill transpart for dedicated nodes", () => {
            testComponent.nodes = createNodes(2);
            fixture.detectChanges();
            const tiles = svg.selectAll("g.node-group");
            expect(tiles.size()).toBe(2);
            tiles.each((d, i, groups) => {
                const group = d3.select(groups[i]);
                const bg = group.select("g.lowpri");

                expect(bg.selectAll("rect").size()).toBe(1, "Should only have 1 rect");
                const rect = bg.select("rect");
                expect(rect).not.toBeFalsy("Should have a rect in lowpri group");
                expect(rect.attr("style")).toContain("fill: transparent");
            });
        });

        it("should use fill url(low-pri-stripes) for low pri nodes", () => {
            testComponent.nodes = createNodes(2, false);
            fixture.detectChanges();
            const tiles = svg.selectAll("g.node-group");
            expect(tiles.size()).toBe(2);
            tiles.each((d, i, groups) => {
                const group = d3.select(groups[i]);
                const bg = group.select("g.lowpri");

                expect(bg.selectAll("rect").size()).toBe(1, "Should only have 1 rect");
                const rect = bg.select("rect");
                expect(rect).not.toBeFalsy("Should have a rect in lowpri group");
                expect(rect.attr("style")).toContain("fill: url(\"#low-pri-stripes\")");
            });
        });
    });

    it("should not fail when the size of the svg is 0x0", () => {
        testComponent.width = "160px";
        testComponent.nodes = createNodes(4);
        fixture.detectChanges();
        heatmap.containerSizeChanged();

        expect(svg.attr("width")).toBe("0", "Svg width should be 4(2 padding)");
        expect(heatmap.dimensions.rows).toBe(0);
        expect(heatmap.dimensions.columns).toBe(0);
        expect(heatmap.dimensions.tileSize).toBe(0);

        const tiles = svg.selectAll("g.node-group");
        expect(tiles.size()).toBe(4);
        tiles.each((d, i, group) => {
            expect(d3.select(group[i]).attr("width")).toBe("0");
            expect(d3.select(group[i]).attr("height")).toBe("0");
            expect(d3.select(group[i]).attr("transform")).not.toContain("NaN");
        });
    });

    it("click on a tile should select the node", () => {
        testComponent.nodes = createNodes(4);
        fixture.detectChanges();

        const groups = svg.selectAll("g.node-group");
        const el: any = groups.nodes()[1];
        click(el);
        fixture.detectChanges();
        expect(heatmap.selectedNodeId.value).toEqual("node-2");
    });

    it("should clear selection when poolId change", () => {
        heatmap.selectedNodeId.next("node-1");
        testComponent.pool = new Pool({ id: "pool-2" });
        fixture.detectChanges();
        expect(heatmap.pool.id).toEqual("pool-2");
        expect(heatmap.selectedNodeId.value).toBeNull();
    });

    it("should show context menu on right click", () => {
        testComponent.nodes = createNodes(4);
        fixture.detectChanges();

        const groups = svg.selectAll("g.node-group");
        const el: any = groups.nodes()[1];
        rightClick(el);
        fixture.detectChanges();

        expect(contextMenuService.openMenu).toHaveBeenCalledOnce();
    });

    it("should go to the node on double click", () => {
        testComponent.nodes = createNodes(4);
        fixture.detectChanges();

        const groups = svg.selectAll("g.node-group");
        const el: any = groups.nodes()[1];
        dblclick(el);
        fixture.detectChanges();

        expect(routerSpy.navigate).toHaveBeenCalledOnce();
    });

    describe("when interactive is off", () => {
        beforeEach(() => {
            testComponent.interactive = false;
            fixture.detectChanges();
        });

        it("click on a tile should not select the node", () => {
            testComponent.nodes = createNodes(4);
            fixture.detectChanges();

            const group = svg.select("g.node-group:nth-child(2)");

            const el: any = group.node();
            click(el);
            fixture.detectChanges();
            expect(heatmap.selectedNodeId.value).toEqual(null);
        });

        it("should not double click", () => {
            testComponent.nodes = createNodes(4);
            fixture.detectChanges();

            const groups = svg.selectAll("g.node-group");
            const el: any = groups.nodes()[1];
            dblclick(el);
            fixture.detectChanges();

            expect(routerSpy.navigate).not.toHaveBeenCalled();
        });

        it("should not allow right click", () => {
            testComponent.nodes = createNodes(4);
            fixture.detectChanges();

            const groups = svg.selectAll("g.node-group");
            const el: any = groups.nodes()[1];
            rightClick(el);
            fixture.detectChanges();

            expect(contextMenuService.openMenu).not.toHaveBeenCalled();
        });
    });

    it("limit the heatmap display to 2500 nodes", () => {
        const nodes = createNodes(2600);
        testComponent.nodes = nodes;
        fixture.detectChanges();
        const tiles = svg.selectAll("g.node-group");
        expect(tiles.size()).toBe(2500);
    });
});

function createNodes(count: number, dedicated = true) {
    const nodes: Node[] = [];
    for (let i = 0; i < count; i++) {
        nodes.push(Fixture.node.create({
            id: `node-${i + 1}`,
            state: NodeState.running,
            isDedicated: dedicated,
            runningTasksCount: defaultRunningTasksCount,
            runningTaskSlotsCount: defaultRunningTaskSlotsCount,
        }));
    }
    return List(nodes);
}
