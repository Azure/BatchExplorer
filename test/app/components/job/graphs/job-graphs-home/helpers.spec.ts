import { List } from "immutable";

import { tasksToCsv } from "app/components/job/graphs/job-graphs-home/helpers";
import { Task } from "app/models";

const startDate1 = new Date(2017, 9, 9, 10, 23, 59);
const endDate1 = new Date(2017, 9, 9, 11, 23, 59);

const startDate2 = new Date(2017, 9, 9, 10, 22, 59);
const endDate2 = new Date(2017, 9, 9, 11, 22, 23);
describe("JobGraphsHome Helpers", () => {
    it("should convert to csv correctly", () => {
        const tasks = List([
            new Task({
                id: "001", nodeInfo: { nodeId: "node-1" },
                executionInfo: {
                    startTime: startDate1,
                    endTime: endDate1,
                    exitCode: 0,
                },
            } as any),
            new Task({
                id: "002", nodeInfo: { nodeId: "node-1" },
                executionInfo: {
                    startTime: startDate2,
                    endTime: endDate2,
                    exitCode: 0,
                },
            } as any),
            new Task({
                id: "003", nodeInfo: { nodeId: "node-1" },
                executionInfo: {
                    startTime: startDate1,
                    endTime: endDate1,
                    exitCode: 1,
                },
            } as any),
        ]);
        const csv = tasksToCsv(tasks);

        const expecetedCsv = [
            "Task id,Exit code,Start time,End time,Node id,Running time(ms)",
            `001,0,${startDate1.toString()},${endDate1.toString()},node-1,3600000`,
            `002,0,${startDate2.toString()},${endDate2.toString()},node-1,3564000`,
            `003,1,${startDate1.toString()},${endDate1.toString()},node-1,3600000`,
        ].join("\n") + "\n";

        expect(csv).toEqual(expecetedCsv);
    });
});
