import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatTooltipModule } from "@angular/material/tooltip";
import { By } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ButtonComponent } from "@batch-flask/ui";
import { ComputeNodeInformation } from "app/models";
import { NodeService, PoolService } from "app/services";
import { of } from "rxjs";
import { click } from "test/utils/helpers";
import { TaskNodeInfoComponent } from "./task-node-info.component";

@Component({
    template: `<bl-task-node-info [nodeInfo]="nodeInfo"></bl-task-node-info>`,
})
class TestComponent {
    public nodeInfo: ComputeNodeInformation = new ComputeNodeInformation({});
}

const routes = [
    { path: "", component: TestComponent },
    { path: "pools/:poolId", component: TestComponent },
    { path: "pools/:poolId/nodes/:nodeId", component: TestComponent },
];

describe("TaskNodeInfoComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let router: Router;

    let poolButtonEl: DebugElement;
    let poolButton: ButtonComponent;
    let nodeButtonEl: DebugElement;
    let nodeButton: ButtonComponent;

    let poolServiceSpy;
    let nodeServiceSpy;

    beforeEach(() => {
        poolServiceSpy = {
            exist: jasmine.createSpy("pool.exist").and.callFake(({ id }) => of(id === "pool-1")),
        };

        nodeServiceSpy = {
            exist: jasmine.createSpy("node.exist").and.callFake(({ id }) => of(id === "node-1")),
        };
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), I18nTestingModule, MatTooltipModule],
            declarations: [TaskNodeInfoComponent, TestComponent, ButtonComponent],
            providers: [
                { provide: PoolService, useValue: poolServiceSpy },
                { provide: NodeService, useValue: nodeServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        router = TestBed.inject(Router);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-task-node-info"));
        fixture.detectChanges();

        poolButtonEl = de.query(By.css(".pool-link"));
        poolButton = poolButtonEl.componentInstance;
        nodeButtonEl = de.query(By.css(".node-link"));
        nodeButton = nodeButtonEl.componentInstance;
    });

    describe("when pool and node exist", () => {
        beforeEach(() => {
            testComponent.nodeInfo = new ComputeNodeInformation({
                poolId: "pool-1",
                nodeId: "node-1",
            });
            fixture.detectChanges();
        });

        it("has the buttons enabled", () => {
            expect(poolButton.disabled).toBe(false);
            expect(nodeButton.disabled).toBe(false);
        });

        it("has the right description", () => {
            expect(poolButton.title).toEqual("task-node-info.navigateToPool");
            expect(nodeButton.title).toEqual("task-node-info.navigateToNode");
        });

        it("navigate to the pool when clicking pool button", async () => {
            click(poolButtonEl);
            await fixture.whenStable();
            expect(router.url).toEqual("/pools/pool-1");
        });

        it("navigate to the node when clicking node button", async () => {
            click(nodeButtonEl);
            await fixture.whenStable();
            expect(router.url).toEqual("/pools/pool-1/nodes/node-1");
        });
    });

    describe("when node doesn't exist", () => {
        beforeEach(() => {
            testComponent.nodeInfo = new ComputeNodeInformation({
                poolId: "pool-1",
                nodeId: "node-deleted",
            });
            fixture.detectChanges();
        });

        it("only has the pool button enabled", () => {
            expect(poolButton.disabled).toBe(false);
            expect(nodeButton.disabled).toBe(true);
        });

        it("has the right description", () => {
            expect(poolButton.title).toEqual("task-node-info.navigateToPool");
            expect(nodeButton.title).toEqual("task-node-info.nodeNotFound");
        });

        it("navigate to the pool when clicking pool button", async () => {
            click(poolButtonEl);
            await fixture.whenStable();
            expect(router.url).toEqual("/pools/pool-1");
        });

        it("does nothing when clicking on node button", async () => {
            click(nodeButtonEl);
            await fixture.whenStable();
            expect(router.url).toEqual("/");
        });
    });

    describe("when pool doesn't exist", () => {
        beforeEach(() => {
            testComponent.nodeInfo = new ComputeNodeInformation({
                poolId: "pool-deleted",
                nodeId: "node-deleted",
            });
            fixture.detectChanges();
        });

        it("all buttons are deleted", () => {
            expect(poolButton.disabled).toBe(true);
            expect(nodeButton.disabled).toBe(true);
        });

        it("has the right description", () => {
            expect(poolButton.title).toEqual("task-node-info.poolNotFound");
            expect(nodeButton.title).toEqual("task-node-info.nodeNotFound");
        });

        it("does nothing when clicking on  pool button", async () => {
            click(nodeButtonEl);
            await fixture.whenStable();
            expect(router.url).toEqual("/");
        });

        it("does nothing when clicking on node button", async () => {
            click(nodeButtonEl);
            await fixture.whenStable();
            expect(router.url).toEqual("/");
        });
    });
});
