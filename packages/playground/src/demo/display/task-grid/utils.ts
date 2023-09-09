import { getLogger } from "@azure/bonito-core";
import { ILoadMoreFn } from "@azure/bonito-ui/lib/components/data-grid";

export interface IDemoTask {
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

export class TasksLoader {
    constructor(public filter?: string, public limit?: number) {}

    log = getLogger("tasks-loader");

    callCount = 0;

    loadTasksFn: ILoadMoreFn<IDemoTask> = async (fresh: boolean = false) => {
        if (fresh) {
            this.callCount = 0;
        }
        this.callCount++;

        this.log.info(`loadTasks param`, {
            filter: this.filter,
            limit: this.limit,
            fresh,
        });

        const tasks = this.generateTasks(this.filter, this.limit);
        const shouldFinish = this.callCount >= 10;
        await waitFor(1000);

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

    generateTasks(filter: string = "", limit: number = 20): IDemoTask[] {
        const tasks: IDemoTask[] = [];

        let taskNum = 0;
        if (Math.random() > 0.3) {
            taskNum = Math.floor(Math.random() * limit);
        }

        for (let i = 0; i < taskNum; i++) {
            const task: IDemoTask = {
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
