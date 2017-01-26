import { List, Record } from "immutable";

const TaskDependenciesRecord = Record({
    taskIds: List([]),
    taskIdRanges: List([]),
});
/**
 * Specifies any dependencies of a task. Any task that is explicitly
 * specified or within a dependency range must complete before the dependant
 * task will be scheduled.
 */
export class TaskDependencies extends TaskDependenciesRecord {
    public taskIds: List<string>;
    public taskIdRanges: List<TaskIdRange>;

    constructor(data) {
        super(Object.assign({}, data, {
            taskIds: List(data.taskIds && data.taskIds),
            taskIdRanges: List(data.taskIdRanges && data.taskIdRanges),
        }));
    }
}

/**
 * A range of task ids that a task can depend on. All tasks with ids
 * in the range must complete successfully before the dependent task can be
 * scheduled.
 */
export class TaskIdRange {
    public start: number;
    public end: number;
}
