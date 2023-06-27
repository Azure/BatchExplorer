import { JobReleaseTask } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { TaskContainerSettingsDecorator } from "./task-container-settings-decorator";

export class JobReleaseTaskDecorator extends DecoratorBase<JobReleaseTask> {
    public commandLine: string;
    public maxWallClockTime: string;
    public retentionTime: string;

    public resourceFiles: {};
    public environmentSettings: {};
    public containerSettings: {};

    constructor(task: JobReleaseTask) {
        super(task);

        this.commandLine = this.stringField(task.commandLine);
        this.maxWallClockTime = this.timespanField(task.maxWallClockTime);
        this.retentionTime = this.timespanField(task.retentionTime);

        this.resourceFiles = task.resourceFiles || {};
        this.environmentSettings = task.environmentSettings || {};
        this.containerSettings = new TaskContainerSettingsDecorator(task.containerSettings || {} as any);
    }
}
