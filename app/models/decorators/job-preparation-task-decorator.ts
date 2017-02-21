import { JobPreparationTask } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { TaskConstraintsDecorator } from "./";

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
