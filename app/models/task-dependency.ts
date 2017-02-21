/**
 * A single dependent task in a list of task dependencies.
 */
export class TaskDependency {
    public id: string;
    public state: string;
    public dependsOn: string;
    public loading: boolean;

    constructor(id: string) {
        this.id = id;
        this.loading = true;
    }
}
