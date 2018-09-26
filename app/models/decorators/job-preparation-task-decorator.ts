import { JobPreparationTask } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { TaskConstraintsDecorator } from "./task-constraints-decorator";
import { TaskContainerSettingsDecorator } from "./task-container-settings-decorator";

export class JobPreparationTaskDecorator extends DecoratorBase<JobPreparationTask> {
    public commandLine: string;
    public waitForSuccess: boolean;
    public rerunOnNodeRebootAfterSuccess: boolean;

    public resourceFiles: {};
    public environmentSettings: {};
    public constraints: {};
    public containerSettings: {};

    constructor(task: JobPreparationTask) {
        super(task);

        this.commandLine = this.stringField(task.commandLine);
        this.waitForSuccess = task.waitForSuccess;
        this.rerunOnNodeRebootAfterSuccess = task.rerunOnNodeRebootAfterSuccess;

        this.resourceFiles = task.resourceFiles || {};
        this.environmentSettings = task.environmentSettings || {};
        this.constraints = new TaskConstraintsDecorator(task.constraints || {} as any);
        this.containerSettings = new TaskContainerSettingsDecorator(task.containerSettings || {} as any);
    }
}
