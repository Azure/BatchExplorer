import { Node } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class NodeDecorator extends DecoratorBase<Node> {
    public url: string;
    public state: string;
    public stateTransitionTime: string;
    public lastBootTime: string;
    public allocationTime: string;
    public ipAddress: string;
    public affinityId: string;
    public vmSize: string;
    public totalTasksRun: string;
    // public startTaskInfo: StartTaskInfoDecorator;

    constructor(node: Node) {
        super(node);

        this.url = this.stringField(node.url);
        this.state = this.stateField(node.state);
        this.stateTransitionTime = this.dateField(node.stateTransitionTime);
        this.lastBootTime = this.dateField(node.lastBootTime);
        this.allocationTime = this.dateField(node.allocationTime);
        this.ipAddress = this.stringField(node.ipAddress);
        this.affinityId = this.stringField(node.affinityId);
        this.vmSize = this.stringField(node.vmSize);
        this.totalTasksRun = this.stringField(node.totalTasksRun);

        // this.startTaskInfo = new StartTaskInfoDecorator(node.startTaskInfo);
    }
}
