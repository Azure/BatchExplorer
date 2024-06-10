import { getLogger } from "@azure/bonito-core";
import { LoadMoreFn } from "@azure/bonito-ui/lib/hooks";
// eslint-disable-next-line no-restricted-imports
import { BatchTaskOutput } from "@batch/ui-service/src/batch-models"; // ask abt this

export interface DemoTask {
    name: string;
    state: "active" | "running" | "preparing" | "completed";
    created: string;
    exitCode: number;
}

async function waitFor(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

export class DemoTasksLoader {
    constructor(
        public filter?: string,
        public limit?: number,
        public noData?: boolean,
        public loadError?: boolean
    ) {}

    log = getLogger("tasks-loader");

    callCount = 0;

    loadTasksFn: LoadMoreFn<DemoTask> = async (fresh: boolean = false) => {
        this.callCount++;

        this.log.info(`loadTasks param`, {
            filter: this.filter,
            limit: this.limit,
            fresh,
        });
        await waitFor(1000);

        if (this.loadError) {
            throw new Error(
                "DemoTasksLoader: Error occurred when loading tasks"
            );
        }

        if (fresh) {
            this.callCount = 0;
        }

        if (this.noData) {
            return {
                items: [],
                done: true,
            };
        }

        const tasks = this.generateTasks(this.filter, this.limit);
        const shouldFinish = this.callCount >= 10;

        this.log.info(`loadTasks: returned`, {
            filter: this.filter,
            limit: this.limit,
            fresh,
            shouldFinish,
            tasks: tasks.length,
        });
        return {
            items: tasks,
            done: shouldFinish,
        };
    };

    generateTasks(filter: string = "", limit: number = 20): DemoTask[] {
        const tasks: DemoTask[] = [];

        let taskNum = 0;
        // 30% chance to have no tasks
        if (Math.random() > 0.3) {
            taskNum = Math.floor(Math.random() * limit);
        }

        for (let i = 0; i < taskNum; i++) {
            const task: DemoTask = {
                name: `Task-${filter + "-" || ""}${Math.random()
                    .toString(36)
                    .slice(-8)}`,
                state: Math.random() > 0.5 ? "active" : "completed",
                created: new Date().toDateString(),
                exitCode: Math.random() > 0.5 ? 0 : 1,
            };
            tasks.push(task);
        }
        return tasks;
    }
}

// Duplicated code used for intern project
export function generateTasksForList(
    accountEndPoint: string,
    jobId: string,
    numOfTasks: number
): BatchTaskOutput[] {
    if (!jobId) {
        throw new Error("Cannot create a task without a valid job ID");
    }

    const taskOutput: BatchTaskOutput[] = [];

    const baseTaskUrl = `https://${accountEndPoint}/jobs/${jobId}/tasks/`;

    for (let i = 0; i < numOfTasks; i++) {
        taskOutput.push({
            url: `${baseTaskUrl}task${i + 1}`,
            id: `task${i + 1}`,
            state: "active",
            executionInfo: { retryCount: 0, requeueCount: 0 },
        });
    }
    return taskOutput;
}
