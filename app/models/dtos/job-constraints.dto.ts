import * as moment from "moment";

import { Dto, DtoAttr } from "@batch-flask/core";

export class JobConstraintDto extends Dto<JobConstraintDto> {
    @DtoAttr(moment.duration) public maxWallClockTime?: moment.Duration;

    @DtoAttr() public maxTaskRetryCount?: number;
}
