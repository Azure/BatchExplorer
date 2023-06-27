import { SubtaskInformation, TaskState } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { ComputeNodeInfoDecorator } from "./compute-node-info-decorator";
import { FailureInfoDecorator } from "./failure-info-decorator";

export class SubTaskDecorator extends DecoratorBase<SubtaskInformation> {
    public exitCode: string;
    public state: string;
    public stateIcon: string;
    public previousState: string;

    public nodeInfo: {};
    public failureInfo: {};

    constructor(task: SubtaskInformation) {
        super(task);

        this.exitCode = this.stringField(task.exitCode);
        this.state = this.stateField(task.state);
        this.stateIcon = this._getStateIcon(task.state);
        this.previousState = this.stateField(task.previousState);

        this.nodeInfo = new ComputeNodeInfoDecorator(task.nodeInfo || {} as any);
        this.failureInfo = new FailureInfoDecorator(task.failureInfo || {} as any);
    }

    // todo: base class ...
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
