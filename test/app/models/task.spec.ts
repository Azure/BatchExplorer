import * as moment from "moment";

import { Task } from "app/models";

function createTask(exitCode: number, startTime: Date, endTime: Date, hasFailureInfo = false) {
    let failureInfo = null;

    if (hasFailureInfo) {
        failureInfo = {
            category: "UserError",
            code: "TaskEnded",
        };
    }
    return new Task({
        executionInfo: {
            startTime,
            endTime,
            exitCode,
            failureInfo,
        },
        constraints: {
            maxWallClockTime: moment.duration("PT4M"),
        },
    });
}

describe("Task Model", () => {
    describe("#didTimeout()", () => {
        it("should return false if execution info or constraints are null", () => {
            expect(new Task().didTimeout).toBe(false);
            expect(new Task({ executionInfo: { startTime: null } }).didTimeout).toBe(false);
            expect(new Task({ constraints: {} }).didTimeout).toBe(false);
        });

        it("Should return false if there is no maxWallClockTime", () => {
            expect(new Task({ executionInfo: {}, constraints: {} }).didTimeout).toBe(false);
        });

        it("should return false if exit code is 0", () => {
            const task = createTask(0, new Date(), new Date());
            expect(task.didTimeout).toBe(false);
        });

        it("should return false if runnnig time is less than clock time", () => {
            const current = moment();
            const task = createTask(0, current.clone().subtract(3, "minute").toDate(), current.toDate(), true);
            expect(task.didTimeout).toBe(false);
        });

        it("should return true if runnnig time is more than clock time", () => {
            const current = moment();
            const task = createTask(-10, current.clone().subtract(5, "minute").toDate(), current.toDate(), true);
            expect(task.didTimeout).toBe(true);
        });
    });
});
