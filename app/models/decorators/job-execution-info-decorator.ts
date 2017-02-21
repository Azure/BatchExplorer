import { JobExecutionInformation } from "app/models";
import { SchedulingErrorDecorator } from "app/models/decorators";
import { DecoratorBase } from "app/utils/decorators";

export class JobExecutionInfoDecorator extends DecoratorBase<JobExecutionInformation> {
    public startTime: string;
    public endTime: string;
    public poolId: string;
    public schedulingError: SchedulingErrorDecorator;
    public terminateReason: string;

    constructor(private executionInfo: JobExecutionInformation) {
        super(executionInfo);

        this.startTime = this.dateField(executionInfo.startTime);
        this.endTime = this.dateField(executionInfo.endTime);
        this.poolId = this.stringField(executionInfo.poolId);
        this.schedulingError = new SchedulingErrorDecorator(executionInfo.schedulingError || <any>{});
        this.terminateReason = this.stringField(executionInfo.terminateReason);
    }
}
