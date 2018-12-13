import { Dto, DtoAttr } from "@batch-flask/core";
import { Duration } from "luxon";
import * as moment from "moment";

export class TaskConstraintsDto extends Dto<TaskConstraintsDto> {
    @DtoAttr(moment.duration) public maxWallClockTime?: Duration;

    @DtoAttr() public maxTaskRetryCount?: number;

    @DtoAttr(moment.duration) public retentionTime?: Duration;
}
