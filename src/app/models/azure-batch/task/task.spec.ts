import { DateTime, Duration } from "luxon";
import { Task } from "./task";

describe("Task model", () => {

    it("set the router link correctly", () => {
        const node = new Task({ id: "task-31", jobId: "job-5" });

        expect(node.routerLink).toEqual(["/jobs", "job-5", "tasks", "task-31"]);
    });

    describe("#didTimeout()", () => {
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
                    maxWallClockTime: Duration.fromISO("PT4M"),
                },
            } as any);
        }

        it("should return false if execution info or constraints are null", () => {
            expect(new Task().didTimeout).toBe(false);
            expect(new Task({ executionInfo: { startTime: null } } as any).didTimeout).toBe(false);
            expect(new Task({ constraints: {} } as any).didTimeout).toBe(false);
        });

        it("Should return false if there is no maxWallClockTime", () => {
            expect(new Task({ executionInfo: {}, constraints: {} } as any).didTimeout).toBe(false);
        });

        it("should return false if exit code is 0", () => {
            const task = createTask(0, new Date(), new Date());
            expect(task.didTimeout).toBe(false);
        });

        it("should return false if runnnig time is less than clock time", () => {
            const current = DateTime.local();
            const task = createTask(0, current.minus({ minutes: 3 }).toJSDate(), current.toJSDate(), true);
            expect(task.didTimeout).toBe(false);
        });

        it("should return true if runnnig time is more than clock time", () => {
            const current = DateTime.local();
            const task = createTask(-10, current.minus({ minutes: 5 }).toJSDate(), current.toJSDate(), true);
            expect(task.didTimeout).toBe(true);
        });
    });

    describe("#runtime", () => {
        it("returns null if execution info is not defined", () => {
            expect(new Task({ id: "task-1" }).runtime).toBe(null);
        });
        it("returns null if start time is not defined", () => {
            expect(new Task({ id: "task-1", executionInfo: {} } as any).runtime).toBe(null);
        });
        it("returns null if end time is not defined", () => {
            expect(new Task({ id: "task-1", executionInfo: { startTime: new Date() } } as any).runtime).toBe(null);
        });
        it("returns runtime in milliseconds when both start and endtime are defined", () => {
            const startTime = new Date(2018, 9, 3, 20, 30, 21);
            const endTime = new Date(2018, 9, 3, 20, 34, 45);
            expect(new Task({ id: "task-1", executionInfo: { startTime, endTime } } as any).runtime).toBe(264_000);
        });
    });
});
