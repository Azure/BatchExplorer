import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import * as d3 from "d3";
import { List } from "immutable";

import { NodesHeatmapComponent, PoolGraphsModule } from "app/components/pool/graphs";
import { Node, NodeState } from "app/models";
import * as Fixture from "test/fixture";

@Component({
    template: `
        <div [style.width]="width" [style.height]="height" [style.position]="'relative'">
            <bex-nodes-heatmap poolId="some-id" [nodes]="nodes"></bex-nodes-heatmap>
        </div>
    `,
})
export class TestHeatmapComponent {
    public width = "700px";
    public height = "500px";
    public nodes: List<Node> = List([]);
}

describe("NodesHeatmapLegendComponent", () => {
    let fixture: ComponentFixture<TestHeatmapComponent>;
    let component: TestHeatmapComponent;
    let heatmap: NodesHeatmapComponent;
    let heatmapContainer: DebugElement;
    let svg: d3.Selection<any, any, any, any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [PoolGraphsModule],
            declarations: [TestHeatmapComponent],
        });
        TestBed.compileComponents();
        fixture = TestBed.createComponent(TestHeatmapComponent);
        component = fixture.componentInstance;
        heatmap = fixture.debugElement.query(By.css("bex-nodes-heatmap")).componentInstance;
        fixture.detectChanges();
        heatmapContainer = fixture.debugElement.query(By.css("bex-nodes-heatmap .heatmap-container"));
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
            expect(d3.select(group[i]).attr("style")).toBe("fill: rgb(107, 163, 203);");
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

});

function createNodes(count: number) {
    const nodes: Node[] = [];
    for (let i = 0; i < count; i++) {
        nodes.push(Fixture.node.create({ state: NodeState.idle }));
    }
    return List(nodes);
}
