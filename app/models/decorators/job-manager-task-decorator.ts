import { JobManagerTask } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { TaskConstraintsDecorator } from "./task-constraints-decorator";

export class JobManagerTaskDecorator extends DecoratorBase<JobManagerTask> {
    public displayName: string;
    public commandLine: string;
    public killJobOnCompletion: boolean;
    public runElevated: boolean;
    public runExclusive: boolean;

    public resourceFiles: {};
    public applicationPackageReferences: {};
    public environmentSettings: {};
    public constraints: {};

    constructor(task?: JobManagerTask) {
        super(task);

        this.displayName = this.stringField(task.displayName);
        this.commandLine = this.stringField(task.commandLine);
        this.killJobOnCompletion = task.killJobOnCompletion;
        this.runElevated = task.runElevated;
        this.runExclusive = task.runExclusive;

        this.resourceFiles = task.resourceFiles || {};
        this.applicationPackageReferences = task.applicationPackageReferences || {};
        this.environmentSettings = task.environmentSettings || {};
        this.constraints = new TaskConstraintsDecorator(task.constraints || {} as any);
    }
}
