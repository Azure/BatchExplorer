import { List } from "immutable";

import { tasksToCsv } from "app/components/job/graphs/job-graphs-home/helpers";
import { Task } from "app/models";

describe("JobGraphsHome Helpers", () => {
    it("should convert to csv correctly", () => {
        const tasks = List([
            new Task({
                id: "001", nodeInfo: { nodeId: "node-1" },
                executionInfo: {
                    startTime: new Date(2017, 9, 9, 10, 23, 59),
                    endTime: new Date(2017, 9, 9, 11, 23, 59), exitCode: 0,
                },
            } as any),
            new Task({
                id: "001", nodeInfo: { nodeId: "node-1" },
                executionInfo: {
                    startTime: new Date(2017, 9, 9, 10, 23, 59),
                    endTime: new Date(2017, 9, 9, 12, 23, 59), exitCode: 0,
                },
            } as any),
            new Task({
                id: "001", nodeInfo: { nodeId: "node-1" },
                executionInfo: {
                    startTime: new Date(2017, 9, 9, 10, 23, 59),
                    endTime: new Date(2017, 9, 9, 13, 23, 59), exitCode: 0,
                },
            } as any),
        ]);
        const csv = tasksToCsv(tasks);

        // tslint:disable:max-line-length
        const expecetedCsv = [
            "Task id,Exit code,Start time,End time,Node id,Running time(ms)",
            "001,0,Mon Oct 09 2017 10:23:59 GMT-0700 (Pacific Daylight Time),Mon Oct 09 2017 11:23:59 GMT-0700 (Pacific Daylight Time),node-1,3600000",
            "001,0,Mon Oct 09 2017 10:23:59 GMT-0700 (Pacific Daylight Time),Mon Oct 09 2017 12:23:59 GMT-0700 (Pacific Daylight Time),node-1,7200000",
            "001,0,Mon Oct 09 2017 10:23:59 GMT-0700 (Pacific Daylight Time),Mon Oct 09 2017 13:23:59 GMT-0700 (Pacific Daylight Time),node-1,10800000",
        ].join("\n") + "\n";
        // tslint:enable:max-line-length

        expect(csv).toEqual(expecetedCsv);
    });
});
