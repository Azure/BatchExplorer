import { Task } from "./task";

/**
 * A single dependent task in a list of task dependencies.
 */
export class TaskDependency {
    public id: string;
    public task: Task;
    public dependsOn: string;
    public loading: boolean;
    public routerLink: any[];

    constructor(id: string) {
        this.id = id;
        this.loading = true;
    }
}
