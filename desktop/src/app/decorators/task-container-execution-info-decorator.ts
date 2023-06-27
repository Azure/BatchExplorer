import { TaskContainerExecutionInfo } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class TaskContainerExecutionInfoDecorator extends DecoratorBase<TaskContainerExecutionInfo> {
    public containerId: string;
    public error: string;
    public state: string;

    constructor(taskContainerExecutionInfo: TaskContainerExecutionInfo) {
        super(taskContainerExecutionInfo);

        this.containerId = this.stringField(taskContainerExecutionInfo.containerId);
        this.error = this.stringField(taskContainerExecutionInfo.error);
        this.state = this.stringField(taskContainerExecutionInfo.state);
    }
}
