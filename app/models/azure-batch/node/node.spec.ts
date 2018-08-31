import { Node } from "./node";

describe("Node model", () => {
    it("set the router link correctly", () => {

        const node = new Node({ id: "node-23", poolId: "pool-24" });

        expect(node.routerLink).toEqual(["/pools", "pool-24", "nodes", "node-23"]);
    });
});
