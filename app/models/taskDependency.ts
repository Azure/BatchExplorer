import { TaskState } from "app/models";

/**
 * A single dependent task in a list of task dependencies.
 */
export class TaskDependency {
    public id: string;
    public state: TaskState;
    public dependsOn: string;

    constructor(id: string) {
        this.id = id;
    }
}
