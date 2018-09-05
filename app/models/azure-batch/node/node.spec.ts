import { List } from "immutable";
import { Node } from "./node";

describe("Node model", () => {
    it("recent tasks should be a list if not set", () => {
        const node = new Node({ id: "node-1" });
        expect(node.recentTasks).not.toBeFalsy();
        expect(node.recentTasks).toEqualImmutable(List([]));
    });

    it("set the router link correctly", () => {
        const node = new Node({ id: "node-23", poolId: "pool-24" });

        expect(node.routerLink).toEqual(["/pools", "pool-24", "nodes", "node-23"]);
    });
});
