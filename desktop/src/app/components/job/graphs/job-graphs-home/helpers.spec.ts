import { Task } from "app/models";
import { List } from "immutable";
import { taskToCsvRow, tasksToCsv } from "./helpers";

const startTime = new Date(2018, 5, 3, 1, 4);
const endTime = new Date(2018, 5, 3, 1, 5);

describe("JobGraphsHelpers", () => {
    describe("#taskToCsvRow", () => {
        it("Works when task is not started yet", () => {
            const row = taskToCsvRow(new Task({ id: "task-1" }));
            expect(row).toEqual("task-1,,,,,");
        });

        it("Works when task is not conpleted yet", () => {
            const row = taskToCsvRow(new Task({ id: "task-1", executionInfo: { startTime } as any }));
            expect(row).toEqual(`task-1,,${startTime.toISOString()},,,NaN`);
        });

        it("Works when task is  conpleted ", () => {
            const row = taskToCsvRow(new Task({
                id: "task-1",
                executionInfo: { startTime, endTime, exitCode: 1 } as any,
                nodeInfo: { nodeId: "node-1" } as any,
            }));
            expect(row).toEqual(`task-1,1,${startTime.toISOString()},${endTime.toISOString()},node-1,60000`);
        });
    });

    it("convert task list to csv", () => {
        const csv = tasksToCsv(List([
            new Task({ id: "task-1" }),
            new Task({ id: "task-2", executionInfo: { startTime } as any }),
        ]));
        expect(csv).toEqual(`Task id,Exit code,Start time,End time,Node id,Running time(ms)\n`
            + "task-1,,,,,\n"
            + `task-2,,${startTime.toISOString()},,,NaN\n`);
    });
});
