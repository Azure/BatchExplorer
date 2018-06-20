import { AutoUserScope, Task, TaskState, UserAccountElevationLevel } from "app/models";
import { TaskContainerSettingsDecorator } from "app/models/decorators";
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
    public successExitCodes: string;

    public exitConditions: {};
    public resourceFiles: {};
    public environmentSettings: {};
    public affinityInfo: {};
    public containerSettings: {};
    public constraints: {};
    public executionInfo: {};
    public nodeInfo: {};
    public multiInstanceSettings: {};
    public stats: {};
    public dependsOn: {};
    public applicationPackageReferences: any[];
    public userIdentitySummary: string;

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

        this.exitConditions = task.exitConditions || {};
        this.resourceFiles = task.resourceFiles || {};
        this.environmentSettings = task.environmentSettings || {};
        this.affinityInfo = task.affinityInfo || {};
        this.containerSettings = new TaskContainerSettingsDecorator(task.containerSettings || {} as any);
        this.constraints = new TaskConstraintsDecorator(task.constraints || {} as any);
        this.executionInfo = new TaskExecutionInfoDecorator(task.executionInfo || {} as any);
        this.nodeInfo = new ComputeNodeInfoDecorator(task.nodeInfo || {} as any);
        this.multiInstanceSettings = task.multiInstanceSettings || {};
        this.stats = task.stats || {};
        this.dependsOn = task.dependsOn || {};
        this.applicationPackageReferences = task.applicationPackageReferences || [];

        this._initUserIdentity();
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

    private _initUserIdentity() {
        const userIdentity = this.original.userIdentity;
        let value;
        if (!userIdentity || (!userIdentity.username && !userIdentity.autoUser)) {
            value = "Task user";
        } else if (userIdentity.autoUser) {
            const isAdmin = userIdentity.autoUser.elevationLevel === UserAccountElevationLevel.admin;
            const isPoolScope = userIdentity.autoUser.scope === AutoUserScope.pool;
            const scope = isPoolScope ? "Pool default user" : "Task default user";
            if (isAdmin) {
                value = `${scope} (Admin)`;
            } else {
                value = scope;
            }
        } else {
            value = userIdentity.username;
        }

        this.userIdentitySummary = value;
    }
}
