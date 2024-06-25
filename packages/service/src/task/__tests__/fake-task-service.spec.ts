import { initMockBatchEnvironment } from "../../environment";
import { BatchFakeSet, BasicBatchFakeSet } from "../../test-util/fakes";
import { FakeTaskService } from "../fake-task-service";

describe("FakeTaskService", () => {
    const accountEndpoint = "mercury.eastus.batch.azure.com";
    const jobId = `faketestjob1`;

    let service: FakeTaskService;
    let fakeSet: BatchFakeSet;

    beforeEach(() => {
        initMockBatchEnvironment();
        fakeSet = new BasicBatchFakeSet();
        service = new FakeTaskService();
        service.setFakes(fakeSet);
    });

    test("Generate tasks", async () => {
        service.numOfTasks = 3;
        service.generateTasks = true;

        const tasks = await service.listTasks(accountEndpoint, jobId);
        const allTasks = [];
        for await (const task of tasks) {
            allTasks.push(task);
        }

        expect(allTasks.length).toEqual(3);
        expect(allTasks[0].id).toEqual("generatedTask1");
        expect(allTasks[1].id).toEqual("generatedTask2");
        expect(allTasks[2].id).toEqual("generatedTask3");
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
        expect(allTasks.map((task) => task.id)).toEqual(["taska", "task1"]);
    });
});
