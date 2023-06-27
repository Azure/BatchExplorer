import { Dto, DtoAttr } from "@batch-flask/core";
import { Duration } from "luxon";

export class TaskConstraintsDto extends Dto<TaskConstraintsDto> {
    @DtoAttr() public maxWallClockTime?: Duration;

    @DtoAttr() public maxTaskRetryCount?: number;

    @DtoAttr() public retentionTime?: Duration;
}
