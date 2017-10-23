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
    return [
        task.id,
        task.executionInfo.exitCode,
        task.executionInfo.startTime,
        task.executionInfo.endTime,
        task.nodeInfo.nodeId,
        task.executionInfo.runningTime.asMilliseconds(),
    ].join(",");
}
