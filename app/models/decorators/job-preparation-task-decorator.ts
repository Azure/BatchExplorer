import { JobPreparationTask } from "app/models";
import { TaskConstraintsDecorator } from "app/models/decorators/task-constraints-decorator";
import { DecoratorBase } from "app/utils/decorators";

export class JobPreparationTaskDecorator extends DecoratorBase<JobPreparationTask> {
    public commandLine: string;
    public waitForSuccess: boolean;
    public runElevated: boolean;
    public rerunOnNodeRebootAfterSuccess: boolean;

    public resourceFiles: {};
    public environmentSettings: {};
    public constraints: {};

    constructor(private task?: JobPreparationTask) {
        super(task);

        this.commandLine = this.stringField(task.commandLine);
        this.waitForSuccess = task.waitForSuccess;
        this.runElevated = task.runElevated;
        this.rerunOnNodeRebootAfterSuccess = task.rerunOnNodeRebootAfterSuccess;

        this.resourceFiles = task.resourceFiles || {};
        this.environmentSettings = task.environmentSettings || {};
        this.constraints = new TaskConstraintsDecorator(task.constraints || <any>{});
    }
}
