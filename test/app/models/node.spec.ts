import { List } from "immutable";

import { Node } from "app/models";

describe("Node Model", () => {
    describe("defaults", () => {
        it("recent tasks should be a list if not set", () => {
            const node = new Node({ id: "node-1" });
            expect(node.recentTasks).not.toBeFalsy();
            expect(node.recentTasks).toEqualImmutable(List([]));
        });
    });
});
