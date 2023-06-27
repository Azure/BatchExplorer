import { DateUtils } from "@batch-flask/utils";
import { TaskExecutionInformation } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { FailureInfoDecorator } from "./failure-info-decorator";
import { TaskContainerExecutionInfoDecorator } from "./task-container-execution-info-decorator";

export class TaskExecutionInfoDecorator extends DecoratorBase<TaskExecutionInformation> {
    public exitCode: string;
    public failureInfo: FailureInfoDecorator;
    public retryCount: string;
    public requeueCount: string;
    public runtime: string;
    public containerInfo: TaskContainerExecutionInfoDecorator;

    constructor(executionInfo: TaskExecutionInformation) {
        super(executionInfo);

        this.exitCode = this.stringField(executionInfo.exitCode);
        this.failureInfo = new FailureInfoDecorator(executionInfo.failureInfo || {} as any);
        this.retryCount = this.stringField(executionInfo.retryCount);
        this.requeueCount = this.stringField(executionInfo.requeueCount);
        this.runtime = DateUtils.computeRuntime(executionInfo.startTime, executionInfo.endTime);
        this.containerInfo = new TaskContainerExecutionInfoDecorator(executionInfo.containerInfo || {} as any);
    }
}
