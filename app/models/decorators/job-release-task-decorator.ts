import { JobReleaseTask } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class JobReleaseTaskDecorator extends DecoratorBase<JobReleaseTask> {
    public commandLine: string;
    public maxWallClockTime: string;
    public retentionTime: string;
    public runElevated: boolean;

    public resourceFiles: {};
    public environmentSettings: {};

    constructor(private task?: JobReleaseTask) {
        super(task);

        this.commandLine = this.stringField(task.commandLine);
        this.maxWallClockTime = this.timespanField(task.maxWallClockTime);
        this.retentionTime = this.timespanField(task.retentionTime);
        this.runElevated = task.runElevated;

        this.resourceFiles = task.resourceFiles || {};
        this.environmentSettings = task.environmentSettings || {};
    }
}
