/**
 * A single dependent task in a list of task dependencies.
 */
export class TaskDependency {
    public id: string;
    public state: string;
    public dependsOn: string;

    constructor(id: string) {
        this.id = id;
    }
}
