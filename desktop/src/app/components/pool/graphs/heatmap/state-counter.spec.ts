import { Node, NodeState } from "app/models";
import { List } from "immutable";
import * as Fixtures from "test/fixture";
import { StateCounter } from "./state-counter";

describe("Statecounter", () => {
    let counter: StateCounter;
    let nodes: Node[];

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
        counter.updateCount(List<Node>(nodes));
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
        counter.updateCount(List(nodes));

        expect(counter.get(NodeState.idle).getValue()).toBe(2);
        expect(counter.get(NodeState.running).getValue()).toBe(3);
        expect(counter.get(NodeState.starting).getValue()).toBe(1);
        expect(counter.get(NodeState.startTaskFailed).getValue()).toBe(1);
        expect(counter.get(NodeState.offline).getValue()).toBe(1);
        expect(counter.get(NodeState.leavingPool).getValue()).toBe(0);
        expect(counter.get(NodeState.rebooting).getValue()).toBe(1);
    });
});
