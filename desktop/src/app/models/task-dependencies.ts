import { ListProp, Model, Record } from "@batch-flask/core";
import { List } from "immutable";

export interface TaskDependenciesAttributes {
    taskIds: string[];
    taskIdRanges: TaskIdRange[];
}

/**
 * Specifies any dependencies of a task. Any task that is explicitly
 * specified or within a dependency range must complete before the dependant
 * task will be scheduled.
 */
@Model()
export class TaskDependencies extends Record<TaskDependenciesAttributes> {
    @ListProp(String) public taskIds: List<string> = List([]);
    @ListProp(Object) public taskIdRanges: List<TaskIdRange> = List([]);
}

/**
 * A range of task ids that a task can depend on. All tasks with ids
 * in the range must complete successfully before the dependent task can be
 * scheduled.
 */
export interface TaskIdRange {
    start: number;
    end: number;
}
