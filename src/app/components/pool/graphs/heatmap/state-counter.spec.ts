import { HttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { Node, NodeState, Pool } from "app/models";
import { PoolResizeDto } from "app/models/dtos";
import { PoolService } from "app/services";
import { List } from "immutable";
import * as Fixtures from "test/fixture";
import { StateCounter } from "./state-counter";

fdescribe("Statecounter", () => {
    let counter: StateCounter;
    let nodes: Node[];
    const poolService: PoolService = new PoolService(TestBed.get(HttpClient));;
    const pool1 = new Pool({
        id: "pool-1", vmSize: "standard_a2",
        targetDedicatedNodes: 8,
    });

    beforeEach(() => {
        counter = new StateCounter();
        nodes = [
            Fixtures.node.create({ state: NodeState.idle }),
            Fixtures.node.create({ state: NodeState.running }),
            Fixtures.node.create({ state: NodeState.idle }),
            Fixtures.node.create({ state: NodeState.starting }),
            Fixtures.node.create({ state: NodeState.idle }),
            Fixtures.node.create({ state: NodeState.startTaskFailed }),
            Fixtures.node.create({ state: NodeState.running }),
            Fixtures.node.create({ state: NodeState.offline }),
        ];
        counter.updateCount(List<Node>(nodes), pool1);
    });

    it("should count the right number of states", () => {
        expect(counter.get(NodeState.idle).getValue()).toBe(3);
        expect(counter.get(NodeState.running).getValue()).toBe(2);
        expect(counter.get(NodeState.starting).getValue()).toBe(1);
        expect(counter.get(NodeState.startTaskFailed).getValue()).toBe(1);
        expect(counter.get(NodeState.offline).getValue()).toBe(1);
        expect(counter.get(NodeState.leavingPool).getValue()).toBe(0);
        expect(counter.get(NodeState.rebooting).getValue()).toBe(0);
    });

    it("should update the count when updating the nodes", (done) => {
        nodes.shift();
        nodes.push(Fixtures.node.create({ state: NodeState.rebooting }));
        nodes.push(Fixtures.node.create({ state: NodeState.running }));
        const resizeDto = new PoolResizeDto({
            targetDedicatedNodes: 10,
            targetLowPriorityNodes: 0,
        });
        poolService.resize("pool-1", resizeDto).subscribe((res) => {
            done();
        });
        counter.updateCount(List(nodes), pool1);

        expect(counter.get(NodeState.idle).getValue()).toBe(2);
        expect(counter.get(NodeState.running).getValue()).toBe(3);
        expect(counter.get(NodeState.starting).getValue()).toBe(1);
        expect(counter.get(NodeState.startTaskFailed).getValue()).toBe(1);
        expect(counter.get(NodeState.offline).getValue()).toBe(1);
        expect(counter.get(NodeState.leavingPool).getValue()).toBe(0);
        expect(counter.get(NodeState.rebooting).getValue()).toBe(1);
    });
});
