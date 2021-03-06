import { JobManagerTask } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { TaskConstraintsDecorator } from "./task-constraints-decorator";
import { TaskContainerSettingsDecorator } from "./task-container-settings-decorator";

export class JobManagerTaskDecorator extends DecoratorBase<JobManagerTask> {
    public displayName: string;
    public commandLine: string;
    public killJobOnCompletion: boolean;
    public runExclusive: boolean;
    public requiredSlots: number;

    public resourceFiles: {};
    public applicationPackageReferences: {};
    public environmentSettings: {};
    public constraints: {};
    public containerSettings: {};

    constructor(task: JobManagerTask) {
        super(task);

        this.displayName = this.stringField(task.displayName);
        this.commandLine = this.stringField(task.commandLine);
        this.killJobOnCompletion = task.killJobOnCompletion;
        this.runExclusive = task.runExclusive;
        this.requiredSlots = task.requiredSlots;

        this.resourceFiles = task.resourceFiles || {};
        this.applicationPackageReferences = task.applicationPackageReferences || {};
        this.environmentSettings = task.environmentSettings || {};
        this.constraints = new TaskConstraintsDecorator(task.constraints || {} as any);
        this.containerSettings = new TaskContainerSettingsDecorator(task.containerSettings || {} as any);
    }
}
