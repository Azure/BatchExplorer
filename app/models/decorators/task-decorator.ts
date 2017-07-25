import { Task, TaskState } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { ComputeNodeInfoDecorator } from "./compute-node-info-decorator";
import { TaskConstraintsDecorator } from "./task-constraints-decorator";
import { TaskExecutionInfoDecorator } from "./task-execution-info-decorator";

export class TaskDecorator extends DecoratorBase<Task> {
    public displayName: string;
    public url: string;
    public eTag: string;
    public lastModified: string;
    public creationTime: string;
    public state: string;
    public stateTransitionTime: string;
    public stateIcon: string;
    public previousState: string;
    public previousStateTransitionTime: string;
    public commandLine: string;
    public runElevated: boolean;
    public successExitCodes: string;

    public exitConditions: {};
    public resourceFiles: {};
    public environmentSettings: {};
    public affinityInfo: {};
    public constraints: {};
    public executionInfo: {};
    public nodeInfo: {};
    public multiInstanceSettings: {};
    public stats: {};
    public dependsOn: {};
    public applicationPackageReferences: any[];

    constructor(task: Task) {
        super(task);

        this.displayName = this.stringField(task.displayName);
        this.url = this.stringField(task.url);
        this.eTag = this.stringField(task.eTag);
        this.lastModified = this.dateField(task.lastModified);
        this.creationTime = this.dateField(task.creationTime);
        this.state = this.stateField(task.state);
        this.stateTransitionTime = this.dateField(task.stateTransitionTime);
        this.stateIcon = this._getStateIcon(task.state);
        this.previousState = this.stateField(task.previousState);
        this.previousStateTransitionTime = this.dateField(task.previousStateTransitionTime);
        this.commandLine = this.stringField(task.commandLine);
        this.runElevated = task.runElevated;

        this.exitConditions = task.exitConditions || {};
        this.resourceFiles = task.resourceFiles || {};
        this.environmentSettings = task.environmentSettings || {};
        this.affinityInfo = task.affinityInfo || {};
        this.constraints = new TaskConstraintsDecorator(task.constraints || {} as any);
        this.executionInfo = new TaskExecutionInfoDecorator(task.executionInfo || {} as any);
        this.nodeInfo = new ComputeNodeInfoDecorator(task.nodeInfo || {} as any);
        this.multiInstanceSettings = task.multiInstanceSettings || {};
        this.stats = task.stats || {};
        this.dependsOn = task.dependsOn || {};
        this.applicationPackageReferences = task.applicationPackageReferences || [];
    }

    private _getStateIcon(state: TaskState): string {
        switch (state) {
            case TaskState.preparing:
                return "fa-spinner";
            case TaskState.active:
            case TaskState.running:
                return "fa-cog";
            case TaskState.completed:
                return "fa-check-circle-o";
            default:
                return "fa-question-circle-o";
        }
    }
}
