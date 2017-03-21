import { List } from "immutable";

import { Node, TaskState } from "app/models";

describe("Node Model", () => {
    describe("defaults", () => {
        it("recent tasks should be a list if not set", () => {
            const node = new Node({ id: "node-1" });
            expect(node.recentTasks).not.toBeFalsy();
            expect(node.recentTasks).toEqualImmutable(List([]));
        });
    });

    describe("#runningTasks", () => {
        it("should return empty list if recentTasks is not defined", () => {
            const node = new Node({ id: "node-1" });
            expect(node.runningTasks.toJS()).toEqual([]);
        });

        it("should return only the running tasks", () => {
            const node = new Node({
                id: "node-1",
                recentTasks: [
                    { taskId: "task-1", taskState: TaskState.running },
                    { taskId: "task-2", taskState: TaskState.active },
                    { taskId: "task-3", taskState: TaskState.preparing },
                    { taskId: "task-4", taskState: TaskState.running },
                    { taskId: "task-5", taskState: TaskState.completed },
                ],
            });
            const runningTasks = node.runningTasks;

            expect(runningTasks.size).toBe(2);
            expect(runningTasks.get(0).taskId).toEqual("task-1");
            expect(runningTasks.get(1).taskId).toEqual("task-4");
        });
    });
});
