export interface IDemoTask {
    name: string;
    state: "active" | "running" | "preparing" | "completed";
    created: string;
    exitCode: number;
}

export interface ILoadMoreListResult<T> {
    done: boolean;
    data: T[];
}

async function waitFor(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

let i = 0;
export async function loadDemoTasks(): Promise<ILoadMoreListResult<IDemoTask>> {
    const tasks: IDemoTask[] = [];

    let taskNum = 0;
    if (Math.random() > 0.3) {
        taskNum = Math.floor(Math.random() * 10);
    }

    for (let i = 0; i < taskNum; i++) {
        const task: IDemoTask = {
            name: `Task-${Math.random().toString(36).slice(-8)}`,
            state: Math.random() > 0.5 ? "active" : "completed",
            created: new Date().toDateString(),
            exitCode: Math.random() > 0.5 ? 0 : 1,
        };
        tasks.push(task);
    }

    await waitFor(1000);
    console.log("taskNum is ", taskNum);
    i++;
    return {
        done: i % 10 === 0,
        data: tasks,
    };
}
