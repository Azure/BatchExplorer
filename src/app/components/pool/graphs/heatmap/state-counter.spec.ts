import { Node, NodeState, Pool } from "app/models";
import { List } from "immutable";
import * as Fixtures from "test/fixture";
import { StateCounter } from "./state-counter";

fdescribe("Statecounter", () => {
    let counter: StateCounter;
    let nodes: Node[];
    let pool1: Pool;

    beforeEach(() => {
        counter = new StateCounter();
        pool1 = new Pool({
            id: "pool-1", vmSize: "standard_a2",
            targetDedicatedNodes: 8,
        });
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

    it("should update the count when updating the nodes", () => {
        nodes.shift();
        nodes.push(Fixtures.node.create({ state: NodeState.rebooting }));
        nodes.push(Fixtures.node.create({ state: NodeState.running }));
        const pool2 = new Pool({
            id: "pool-2", vmSize: "standard_a2",
            targetDedicatedNodes: 10,
        });
        counter.updateCount(List(nodes), pool2);

        expect(counter.get(NodeState.idle).getValue()).toBe(2);
        expect(counter.get(NodeState.running).getValue()).toBe(3);
        expect(counter.get(NodeState.starting).getValue()).toBe(1);
        expect(counter.get(NodeState.startTaskFailed).getValue()).toBe(1);
        expect(counter.get(NodeState.offline).getValue()).toBe(1);
        expect(counter.get(NodeState.leavingPool).getValue()).toBe(0);
        expect(counter.get(NodeState.rebooting).getValue()).toBe(1);
    });
});
