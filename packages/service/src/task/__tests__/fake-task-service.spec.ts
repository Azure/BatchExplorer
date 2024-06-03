import { initMockBatchEnvironment } from "../../environment";
import { BatchFakeSet, BasicBatchFakeSet } from "../../test-util/fakes";
import { FakeTaskService } from "../fake-task-service";

describe("FakeTaskService", () => {
    const accountEndpoint = "mercury.eastus.batch.azure.com";
    const jobId = `faketestjob1`;
    const taskIds = ["syn_20240529_abcdef", "syn_20240529_123456"];
    const taskIdNums = "syn_20240529_123456";
    const taskIdLetters = "syn_20240529_abcdef";

    let service: FakeTaskService;
    let fakeSet: BatchFakeSet;

    beforeEach(() => {
        initMockBatchEnvironment();
        fakeSet = new BasicBatchFakeSet();
        service = new FakeTaskService();
        service.setFakes(fakeSet);
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
        const taskNums = await service.getTask(
            accountEndpoint,
            jobId,
            taskIdNums
        );
        const taskLetters = await service.getTask(
            accountEndpoint,
            jobId,
            taskIdLetters
        );

        expect(taskNums.id).toEqual("syn_20240529_123456");
        expect(taskLetters.id).toEqual("syn_20240529_abcdef");
    });
});
