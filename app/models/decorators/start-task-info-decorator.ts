import * as moment from "moment";

import { StartTaskInfo } from "app/models";
import { DateUtils } from "app/utils";
import { DecoratorBase } from "app/utils/decorators";

export class StartTaskInfoDecorator extends DecoratorBase<StartTaskInfo> {
    public state: string;
    public startTime: string;
    public endTime: string;
    public exitCode: string;
    public executionTime: string;
    public retryCount: string;

    constructor(startTaskInfo: StartTaskInfo) {
        super(startTaskInfo);

        this.state = this.stateField(startTaskInfo.state);
        this.startTime = this.dateField(startTaskInfo.startTime);
        this.endTime = this.dateField(startTaskInfo.endTime);
        this.exitCode = this.numberField(startTaskInfo.exitCode);
        this.retryCount = this.numberField(startTaskInfo.retryCount);

        if (!startTaskInfo.startTime) {
            this.executionTime = "not started";
        } else {
            const endTime = startTaskInfo.endTime === null ? moment.utc() : moment.utc(startTaskInfo.endTime);
            const runtime = moment.duration(endTime.diff(moment(startTaskInfo.startTime)));
            this.executionTime = DateUtils.prettyDuration(runtime);
        }
    }
}
