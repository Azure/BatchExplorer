import { DateUtils } from "@batch-flask/utils";
import { StartTaskInfo } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { FailureInfoDecorator } from "./failure-info-decorator";

export class StartTaskInfoDecorator extends DecoratorBase<StartTaskInfo> {
    public state: string;
    public startTime: string;
    public endTime: string;
    public exitCode: string;
    public runtime: string;
    public failureInfo: FailureInfoDecorator;
    public retryCount: string;

    constructor(startTaskInfo: StartTaskInfo) {
        super(startTaskInfo);

        this.state = this.stateField(startTaskInfo.state);
        this.startTime = this.dateField(startTaskInfo.startTime);
        this.endTime = this.dateField(startTaskInfo.endTime);
        this.exitCode = this.numberField(startTaskInfo.exitCode);
        this.retryCount = this.numberField(startTaskInfo.retryCount);
        this.runtime = DateUtils.computeRuntime(startTaskInfo.startTime, startTaskInfo.endTime);
        this.failureInfo = new FailureInfoDecorator(startTaskInfo.failureInfo || {} as any);
    }
}
