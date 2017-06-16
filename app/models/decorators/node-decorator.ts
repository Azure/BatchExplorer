import { Node } from "app/models";
import { StartTaskInfoDecorator } from "app/models/decorators/start-task-info-decorator";
import { DecoratorBase } from "app/utils/decorators";

export class NodeDecorator extends DecoratorBase<Node> {
    public url: string;
    public state: string;
    public stateTransitionTime: string;
    public schedulingState: string;
    public lastBootTime: string;
    public allocationTime: string;
    public ipAddress: string;
    public affinityId: string;
    public vmSize: string;
    public runningTasksCount: string;
    public totalTasksRun: string;
    public totalTasksSucceeded: string;
    public startTaskInfo: StartTaskInfoDecorator;

    constructor(node: Node) {
        super(node);

        this.url = this.stringField(node.url);
        this.state = this.stateField(node.state);
        this.stateTransitionTime = this.dateField(node.stateTransitionTime);
        this.schedulingState = this.stateField(node.schedulingState);
        this.lastBootTime = this.dateField(node.lastBootTime);
        this.allocationTime = this.dateField(node.allocationTime);
        this.ipAddress = this.stringField(node.ipAddress);
        this.affinityId = this.stringField(node.affinityId);
        this.vmSize = this.stringField(node.vmSize);
        this.runningTasksCount = this.stringField(node.runningTasksCount);
        this.totalTasksRun = this.stringField(node.totalTasksRun);
        this.totalTasksSucceeded = this.stringField(node.totalTasksSucceeded);
        this.startTaskInfo = new StartTaskInfoDecorator(node.startTaskInfo || {} as any);
    }
}
