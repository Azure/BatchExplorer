import { DateUtils } from "@batch-flask/utils";
import { JobScheduleExecutionInformation, RecentJob } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class JobScheduleExecutionInfoDecorator extends DecoratorBase<JobScheduleExecutionInformation> {
    public nextRunTime: string;
    public endTime: string;
    public recentJob: RecentJob;
    public nextRunTimeFromNow: string;
    public endTimeFromNow: string;

    constructor(executionInfo: JobScheduleExecutionInformation) {
        super(executionInfo);

        this.nextRunTime = this.dateField(executionInfo.nextRunTime);
        this.endTime = this.dateField(executionInfo.endTime);
        this.recentJob = executionInfo.recentJob;

        if (executionInfo.nextRunTime) {
            this.nextRunTimeFromNow = DateUtils.timeFromNow(executionInfo.nextRunTime);
        }

        if (executionInfo.endTime) {
            this.endTimeFromNow = DateUtils.timeFromNow(executionInfo.endTime);
        }
    }
}
