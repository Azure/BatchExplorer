import { getLogger } from "@azure/bonito-core";

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

let i = 0;
export async function loadDemoTasks(params?: {
    filter?: string;
    nextToken?: string;
}): Promise<{
    nextToken?: string;
    list: IDemoTask[];
}> {
    const log = getLogger("task-grid-demo");
    const { filter, nextToken } = params || {};
    log.info(`loadDemoTasks: filter: ${filter}, nextToken: ${nextToken}`);
    const tasks: IDemoTask[] = [];

    let taskNum = 0;
    if (Math.random() > 0.3) {
        taskNum = Math.floor(Math.random() * 20);
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

    await waitFor(1000);
    log.info(`${filter}, ${nextToken}, ${tasks.length} tasks returned`);

    i++;
    console.log(i);
    // const shouldFinish = i % 10 === 0 || (i + 1) % 10 === 0;

    return {
        // nextToken: shouldFinish
        //     ? undefined
        //     : String(Number(nextToken || 0) + 1),
        list: [],
    };
}
