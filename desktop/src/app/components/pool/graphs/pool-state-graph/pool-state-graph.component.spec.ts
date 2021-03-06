import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ChartDirective } from "@batch-flask/ui";
import { Pool } from "app/models";
import { PoolNodeCountService, PoolNodeCounts } from "app/services";
import { BehaviorSubject } from "rxjs";
import { ContextMenuServiceMock } from "test/utils/mocks";
import { PoolStateGraphComponent } from "./pool-state-graph.component";

const nodeCounts = new Map()
    .set("pool1", new PoolNodeCounts({
        dedicated: {
            creating: 0,
            idle: 0,
            leavingpool: 0,
            offline: 0,
            preempted: 0,
            rebooting: 0,
            reimaging: 0,
            running: 0,
            starting: 0,
            startTaskFailed: 0,
            unknown: 0,
            unusable: 0,
            waitingForStartTask: 0,
            total: 0,
        },
        lowPriority: {
            creating: 0,
            idle: 0,
            leavingpool: 0,
            offline: 0,
            preempted: 0,
            rebooting: 0,
            reimaging: 0,
            running: 2,
            starting: 1,
            startTaskFailed: 0,
            unknown: 0,
            unusable: 0,
            waitingForStartTask: 0,
            total: 3,
        },
    }))
    .set("pool2", new PoolNodeCounts({
        dedicated: {
            creating: 0,
            idle: 1,
            leavingpool: 0,
            offline: 3,
            preempted: 0,
            rebooting: 0,
            reimaging: 0,
            running: 0,
            starting: 0,
            startTaskFailed: 0,
            unknown: 0,
            unusable: 0,
            waitingForStartTask: 0,
            total: 4,
        },
        lowPriority: {
            creating: 0,
            idle: 0,
            leavingpool: 0,
            offline: 0,
            preempted: 0,
            rebooting: 0,
            reimaging: 0,
            running: 0,
            starting: 0,
            startTaskFailed: 0,
            unknown: 0,
            unusable: 0,
            waitingForStartTask: 0,
            total: 0,
        },
    }))
    .set("pool3", new PoolNodeCounts({
        dedicated: {
            creating: 0,
            idle: 5,
            leavingpool: 0,
            offline: 0,
            preempted: 0,
            rebooting: 0,
            reimaging: 4,
            running: 0,
            starting: 0,
            startTaskFailed: 0,
            unknown: 0,
            unusable: 0,
            waitingForStartTask: 0,
            total: 9,
        },
        lowPriority: {
            creating: 7,
            idle: 0,
            leavingpool: 0,
            offline: 0,
            preempted: 0,
            rebooting: 0,
            reimaging: 0,
            running: 4,
            starting: 0,
            startTaskFailed: 0,
            unknown: 0,
            unusable: 0,
            waitingForStartTask: 0,
            total: 11,
        },
    }));
@Component({
    template: `<bl-pool-state-graph [pool]="pool" [interactive]="interactive"></bl-pool-state-graph>`,
})
class TestComponent {
    public pool: Pool;
    public interactive = true;
}

describe("PoolStateGraphComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: PoolStateGraphComponent;
    let de: DebugElement;
    let chartDirective: ChartDirective;

    let contextMenuServiceSpy: ContextMenuServiceMock;
    let nodeCountServiceSpy;

    beforeEach(() => {
        contextMenuServiceSpy = new ContextMenuServiceMock();
        nodeCountServiceSpy = {
            counts: new BehaviorSubject(null),
            refresh: jasmine.createSpy(),
        };
        TestBed.configureTestingModule({
            imports: [],
            declarations: [PoolStateGraphComponent, TestComponent, ChartDirective],
            providers: [
                contextMenuServiceSpy.asProvider(),
                { provide: PoolNodeCountService, useValue: nodeCountServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-pool-state-graph"));
        chartDirective = de.query(By.directive(ChartDirective)).injector.get(ChartDirective);
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("show nothing if node counts are not loaded", () => {
        expect(component.datasets.length).toBe(2);
        expect(component.datasets[0]).toEqual(jasmine.objectContaining({ label: "Dedicated nodes", data: [] }));
        expect(component.datasets[1]).toEqual(jasmine.objectContaining({ label: "Low priority nodes", data: [] }));
    });

    describe("when no pool provided", () => {
        it("show data set with a sum of all pools", () => {
            nodeCountServiceSpy.counts.next(nodeCounts);
            expect(component.datasets.length).toBe(2);
            expect(component.datasets[0]).toEqual(jasmine.objectContaining({
                label: "Dedicated nodes",
                data: [ 6, 0, 0, 3, 0, 4, 0 ],
            }));
            expect(component.datasets[1]).toEqual(jasmine.objectContaining({
                label: "Low priority nodes",
                data: [ 0, 6, 0, 0, 0, 8, 0 ],
            }));
        });
    });

    describe("when a pool provided", () => {
        beforeEach(() => {
            testComponent.pool = new Pool({id: "pool3"});
            fixture.detectChanges();
        });

        it("show data set with a sum of all pools", () => {
            nodeCountServiceSpy.counts.next(nodeCounts);
            expect(component.datasets.length).toBe(2);
            expect(component.datasets[0]).toEqual(jasmine.objectContaining({
                label: "Dedicated nodes",
                data: [ 5, 0, 0, 0, 0, 4, 0 ],
            }));
            expect(component.datasets[1]).toEqual(jasmine.objectContaining({
                label: "Low priority nodes",
                data: [ 0, 4, 0, 0, 0, 7, 0 ],
            }));
        });
    });

    describe("when not in interactive mode", () => {
        beforeEach(() => {
            testComponent.interactive  = false;
            fixture.detectChanges();
        });

        it("change to a pie chart", () => {
            expect(chartDirective.chartType).toEqual("pie");
        });

        it("Combine low pri and dedicated", () => {
            nodeCountServiceSpy.counts.next(nodeCounts);
            expect(component.datasets.length).toBe(1);
            expect(component.datasets[0]).toEqual(jasmine.objectContaining({
                label: "Nodes",
                data: [ 6, 6, 0, 3, 0, 12, 0 ],
            }));
        });
    });
});
