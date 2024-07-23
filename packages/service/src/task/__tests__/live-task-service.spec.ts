import { getMockEnvironment } from "@azure/bonito-core/lib/environment";
import { MockHttpClient, MockHttpResponse } from "@azure/bonito-core/lib/http";
import { BatchApiVersion } from "../../constants";
import { initMockBatchEnvironment } from "../../environment";
import { BasicBatchFakeSet, BatchFakeSet } from "../../test-util/fakes";
import { LiveTaskService } from "../live-task-service";
import { TaskService } from "../task-service";

describe("LiveTaskService", () => {
    const hoboAcctEndpoint = "mercury.eastus.batch.azure.com";

    let service: TaskService;
    let fakeSet: BatchFakeSet;

    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockBatchEnvironment();
        httpClient = getMockEnvironment().getHttpClient();
        service = new LiveTaskService();
        fakeSet = new BasicBatchFakeSet();
    });

    test("Simple get", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `https://${hoboAcctEndpoint}/jobs/faketestjob1/tasks/task1?api-version=${BatchApiVersion.data}`,
                {
                    status: 200,
                    body: JSON.stringify(
                        fakeSet.getTask(
                            hoboAcctEndpoint,
                            "faketestjob1",
                            "task1"
                        )
                    ),
                }
            )
        );

        const task = await service.getTask(
            hoboAcctEndpoint,
            "faketestjob1",
            "task1"
        );
        expect(task).toBeDefined();
        expect(task?.id).toEqual("task1");
    });

    test("List by job", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `https://${hoboAcctEndpoint}/jobs/faketestjob1/tasks?api-version=${BatchApiVersion.data}`,
                {
                    status: 200,
                    body: JSON.stringify({
                        value: fakeSet.listTasks(
                            hoboAcctEndpoint,
                            "faketestjob1"
                        ),
                    }),
                }
            )
        );

        const tasks = await service.listTasks(hoboAcctEndpoint, "faketestjob1");
        const allTasks = [];
        for await (const task of tasks) {
            allTasks.push(task);
        }
        expect(allTasks.length).toBe(2);
        expect(allTasks[0].id).toEqual("taska");
        expect(allTasks[1].id).toEqual("task1");
    });

    test("Get task counts", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `https://${hoboAcctEndpoint}/jobs/faketestjob1/taskcounts?api-version=${BatchApiVersion.data}`,
                {
                    status: 200,
                    body: JSON.stringify(
                        fakeSet.getTaskCounts(hoboAcctEndpoint, "faketestjob1")
                    ),
                }
            )
        );

        const taskCounts = await service.getTaskCounts(
            hoboAcctEndpoint,
            "faketestjob1"
        );
        expect(taskCounts).toBeDefined();
        expect(taskCounts?.taskCounts.active).toEqual(1);
        expect(taskCounts?.taskSlotCounts.active).toEqual(5);
    });
});
