import { TaskExecutionInformation } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { FailureInfoDecorator } from "./failure-info-decorator";

export class TaskExecutionInfoDecorator extends DecoratorBase<TaskExecutionInformation> {
    public startTime: string;
    public endTime: string;
    public exitCode: string;
    public failureInfo: FailureInfoDecorator;
    public retryCount: string;
    public lastRetryTime: string;
    public requeueCount: string;
    public lastRequeueTime: string;

    constructor(executionInfo: TaskExecutionInformation) {
        super(executionInfo);

        this.startTime = this.dateField(executionInfo.startTime);
        this.endTime = this.dateField(executionInfo.endTime);
        this.exitCode = this.stringField(executionInfo.exitCode);
        this.failureInfo = new FailureInfoDecorator(executionInfo.failureInfo || {} as any);
        this.retryCount = this.stringField(executionInfo.retryCount);
        this.lastRetryTime = this.dateField(executionInfo.lastRetryTime);
        this.requeueCount = this.stringField(executionInfo.requeueCount);
        this.lastRequeueTime = this.dateField(executionInfo.lastRequeueTime);
    }
}
