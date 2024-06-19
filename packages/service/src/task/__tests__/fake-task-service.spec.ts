import { initMockBatchEnvironment } from "../../environment";
import { BatchFakeSet, BasicBatchFakeSet } from "../../test-util/fakes";
import { FakeTaskService } from "../fake-task-service";

describe("FakeTaskService", () => {
    const accountEndpoint = "mercury.eastus.batch.azure.com";
    const jobId = `faketestjob1`;
    const taskIds = ["task1", "task2", "task3"];
    const harcodedTaskIds = ["taska", "task1"];

    let service: FakeTaskService;
    let fakeSet: BatchFakeSet;

    beforeEach(() => {
        initMockBatchEnvironment();
        fakeSet = new BasicBatchFakeSet();
        service = new FakeTaskService();
        service.setFakes(fakeSet);
    });

    test("Generate tasks", async () => {
        const tasks = await service.listTasks(accountEndpoint, jobId, 3);
        const allTasks = [];
        for await (const task of tasks) {
            allTasks.push(task);
        }

        expect(allTasks[0].id).toEqual("task1");
        expect(allTasks[1].id).toEqual("task2");
        expect(allTasks[2].id).toEqual("task3");
    });

    test("List batch tasks", async () => {
        const tasks = await service.listTasks(accountEndpoint, jobId);

        const allTasks = [];

        for await (const task of tasks) {
            allTasks.push(task);
        }
        expect(allTasks.map((task) => task.id)).toEqual(taskIds);
    });

    test("Get specific batch task", async () => {
        const taskNum = await service.getTask(accountEndpoint, jobId, "task1");
        const taskLetter = await service.getTask(
            accountEndpoint,
            jobId,
            "taska"
        );

        expect(taskNum.id).toEqual("task1");
        expect(taskLetter.id).toEqual("taska");
    });

    test("List hardcoded batch tasks", async () => {
        const tasks = await service.listTasks(accountEndpoint, jobId);

        const allTasks = [];

        for await (const task of tasks) {
            allTasks.push(task);
        }
        expect(allTasks.map((task) => task.id)).toEqual(harcodedTaskIds);
    });
});
