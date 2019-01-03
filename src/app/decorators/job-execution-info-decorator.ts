import { DateUtils } from "@batch-flask/utils";
import { JobExecutionInformation } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { FailureInfoDecorator } from "./failure-info-decorator";

export class JobExecutionInfoDecorator extends DecoratorBase<JobExecutionInformation> {
    public startTime: string;
    public endTime: string;
    public poolId: string;
    public schedulingError: FailureInfoDecorator;
    public terminateReason: string;
    public runtime: string;

    constructor(executionInfo: JobExecutionInformation) {
        super(executionInfo);

        this.startTime = this.dateField(executionInfo.startTime);
        this.endTime = this.dateField(executionInfo.endTime);
        this.poolId = this.stringField(executionInfo.poolId);
        this.schedulingError = new FailureInfoDecorator(executionInfo.schedulingError || {} as any);
        this.terminateReason = this.stringField(executionInfo.terminateReason);
        this.runtime = DateUtils.computeRuntime(executionInfo.startTime, executionInfo.endTime);
    }
}
