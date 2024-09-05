import { Dto, DtoAttr } from "@batch-flask/core/dto";
import { Duration } from "luxon";

export class JobConstraintDto extends Dto<JobConstraintDto> {
    @DtoAttr() public maxWallClockTime?: Duration;

    @DtoAttr() public maxTaskRetryCount?: number;
}
