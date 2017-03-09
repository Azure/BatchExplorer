import { Component, DebugElement, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import * as d3 from "d3";
import { List } from "immutable";

import { NodesHeatmapComponent, NodesHeatmapLegendComponent } from "app/components/pool/graphs";
import { Node, NodeState } from "app/models";
import { NodeService } from "app/services";
import * as Fixture from "test/fixture";
import { click } from "test/utils/helpers";
import { ContextMenuServiceMock } from "test/utils/mocks";

@Component({
    template: `
        <div [style.width]="width" [style.height]="height" [style.position]="'relative'">
            <bl-nodes-heatmap [poolId]="poolId" [nodes]="nodes"></bl-nodes-heatmap>
        </div>
    `,
})
export class HeatmapMockComponent {
    public width = "700px";
    public height = "500px";
    public nodes: List<Node> = List([]);
    public poolId = "pool-1";
}

@Component({
    selector: "bl-node-preview-card",
    template: "",
})
export class NodePreviewCardMockComponent {
    @Input()
    public node: Node;

    @Input()
    public poolId: string;
}

describe("NodesHeatmapLegendComponent", () => {
    let fixture: ComponentFixture<HeatmapMockComponent>;
    let component: HeatmapMockComponent;
    let heatmap: NodesHeatmapComponent;
    let heatmapContainer: DebugElement;
    let svg: d3.Selection<any, any, any, any>;
    let contextMenuService: ContextMenuServiceMock;

    beforeEach(() => {
        contextMenuService = new ContextMenuServiceMock();
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            declarations: [
                HeatmapMockComponent, NodesHeatmapComponent, NodesHeatmapLegendComponent, NodePreviewCardMockComponent,
            ],
            providers: [
                { provide: NodeService, useValue: {} },
                contextMenuService.asProvider(),
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(HeatmapMockComponent);
        component = fixture.componentInstance;
        heatmap = fixture.debugElement.query(By.css("bl-nodes-heatmap")).componentInstance;
        fixture.detectChanges();

        heatmapContainer = fixture.debugElement.query(By.css("bl-nodes-heatmap .heatmap-container"));
        svg = d3.select(heatmapContainer.nativeElement).select("svg");
        heatmap.containerSizeChanged();
    });

    it("Should have created the svg in the right dimensions", () => {
        expect(svg).not.toBeNull();
        const legendWidth = 160;
        expect(svg.attr("width")).toBe((700 - legendWidth).toString());
        expect(svg.attr("height")).toBe("500");
    });

    it("should reszize the svg when container width change", () => {
        component.width = "800px";
        fixture.detectChanges();
        const legendWidth = 160;

        // Force notify because the element-reszize-detector is not instant
        heatmap.containerSizeChanged();
        expect(svg.attr("width")).toBe((800 - legendWidth).toString());
        expect(svg.attr("height")).toBe("500");
    });

    it("Should compute optimal tile dimensions for 1 tile(Max tile size)", () => {
        component.nodes = List([
            Fixture.node.create({ state: NodeState.idle }),
        ]);
        fixture.detectChanges();
        expect(heatmap.dimensions.columns).toBe(1);
        expect(heatmap.dimensions.rows).toBe(1);
        expect(heatmap.dimensions.tileSize).toBe(300);
    });

    it("Should compute optimal tile dimensions for 4 tile", () => {
        component.nodes = createNodes(4);
        fixture.detectChanges();
        expect(heatmap.dimensions.columns).toBe(2);
        expect(heatmap.dimensions.rows).toBe(2);
        expect(heatmap.dimensions.tileSize).toBe(250);
    });

    it("should create a tile for each node", () => {
        component.nodes = createNodes(7);
        fixture.detectChanges();
        const rects = svg.selectAll("rect");
        expect(rects.size()).toBe(7);
        const size = (heatmap.dimensions.tileSize - 2).toString();
        rects.each((d, i, group) => {
            expect(d3.select(group[i]).attr("width")).toBe(size);
            expect(d3.select(group[i]).attr("height")).toBe(size);
            expect(d3.select(group[i]).attr("style")).toContain("fill: rgb(107, 163, 203);");
            expect(d3.select(group[i]).attr("style")).toContain("stroke-width: 0;");
        });
    });

    it("should not fail when the size of the svg is 0x0", () => {
        component.width = "160px";
        component.nodes = createNodes(4);
        fixture.detectChanges();
        heatmap.containerSizeChanged();

        expect(svg.attr("width")).toBe("0");
        expect(heatmap.dimensions.rows).toBe(0);
        expect(heatmap.dimensions.columns).toBe(0);
        expect(heatmap.dimensions.tileSize).toBe(0);

        const rects = svg.selectAll("rect");
        expect(rects.size()).toBe(4);
        rects.each((d, i, group) => {
            expect(d3.select(group[i]).attr("width")).toBe("0");
            expect(d3.select(group[i]).attr("height")).toBe("0");
            expect(d3.select(group[i]).attr("transform")).not.toContain("NaN");
        });
    });

    it("click on a tile should select the node", () => {
        component.nodes = createNodes(4);
        fixture.detectChanges();

        const rect = svg.select("rect:nth-child(2)");

        const el: any = rect.node();
        click(el);
        fixture.detectChanges();
        expect(heatmap.selectedNodeId.value).toEqual("node-2");
    });

    it("should clear selection when poolId change", () => {
        heatmap.selectedNodeId.next("node-1");
        // TOOD fix
        // component.poolId = "pool-2";
        // fixture.detectChanges();
        // expect(heatmap.poolId).toEqual("pool-2");
        // expect(heatmap.selectedNodeId.value).toBeNull();
    });
});

function createNodes(count: number) {
    const nodes: Node[] = [];
    for (let i = 0; i < count; i++) {
        nodes.push(Fixture.node.create({ id: `node-${i + 1}`, state: NodeState.idle }));
    }
    return List(nodes);
}
