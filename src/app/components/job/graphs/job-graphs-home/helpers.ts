import { Task } from "app/models";
import { List } from "immutable";

export function tasksToCsv(tasks: List<Task>) {
    const data = tasks.map(taskToCsvRow).join("\n");
    return `${taskCsvHeader()}\n${data}\n`;
}

export function taskCsvHeader() {
    return [
        "Task id",
        "Exit code",
        "Start time",
        "End time",
        "Node id",
        "Running time(ms)",
    ];
}

export function taskToCsvRow(task: Task) {
    const info = task.executionInfo;
    const runtime = info && info.runningTime;
    const nodeInfo = task.nodeInfo;
    return [
        task.id,
        info && info.exitCode,
        info && info.startTime && info.startTime.toISOString(),
        info && info.endTime && info.endTime.toISOString(),
        nodeInfo && nodeInfo.nodeId,
        runtime && runtime.asMilliseconds(),
    ].join(",");
}
