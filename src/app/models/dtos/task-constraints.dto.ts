import * as moment from "moment";

import { Dto, DtoAttr } from "@batch-flask/core";

export class TaskConstraintsDto extends Dto<TaskConstraintsDto> {
    @DtoAttr(moment.duration) public maxWallClockTime?: moment.Duration;

    @DtoAttr() public maxTaskRetryCount?: number;

    @DtoAttr(moment.duration) public retentionTime?: moment.Duration;
}
